# Data Model: 流量配额管理与 UI 增强

**Feature**: 010-traffic-quota-ui
**Date**: 2026-01-14
**Source**: [spec.md](./spec.md)

## Entities

### 1. TrafficQuota（流量配额）

用户的流量限制配置。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quotaBytes | number | Yes | 配额总量（字节），-1 表示无限制 |
| quotaType | enum | Yes | 配额类型：'limited' \| 'unlimited' |
| usedBytes | number | Yes | 已使用流量（字节） |
| lastReset | string | Yes | 上次重置时间（ISO 8601） |
| status | enum | Yes | 状态：'active' \| 'disabled' \| 'exceeded' |

**Validation Rules**:
- `quotaBytes` >= -1（-1 表示无限制，0 无效）
- `quotaType` 为 'unlimited' 时，`quotaBytes` 必须为 -1
- `usedBytes` >= 0
- `lastReset` 必须是有效的 ISO 8601 日期字符串

---

### 2. TrafficUsage（流量使用）

从 Xray Stats API 获取的实时流量数据。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | 用户邮箱标识 |
| uplink | number | Yes | 上行流量（字节） |
| downlink | number | Yes | 下行流量（字节） |
| total | number | Yes | 总流量（字节） |
| queriedAt | string | Yes | 查询时间（ISO 8601） |

**Validation Rules**:
- `uplink` >= 0
- `downlink` >= 0
- `total` = `uplink` + `downlink`

---

### 3. UserWithQuota（带配额的用户）

扩展现有 User 类型，包含流量配额信息。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | 用户 UUID |
| email | string | Yes | 用户邮箱标识 |
| quota | TrafficQuota | Yes | 流量配额配置 |
| usage | TrafficUsage | No | 当前流量使用（可能不可用） |
| usagePercent | number | No | 使用百分比（0-100，无限制时为 0） |
| alertLevel | enum | No | 警告级别：'normal' \| 'warning' \| 'exceeded' |

---

### 4. QuotaConfig（配额配置文件）

存储在 `/usr/local/etc/xray/quota.json` 的配置结构。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | Yes | 配置版本号 |
| apiPort | number | Yes | Xray Stats API 端口 |
| users | Record<string, TrafficQuota> | Yes | 用户配额映射（key 为 email） |

---

### 5. XrayStatsConfig（Xray 统计配置）

需要添加到 Xray config.json 的统计相关配置。

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| stats | object | Yes | 空对象，启用统计功能 |
| policy | PolicyConfig | Yes | 策略配置 |
| api | ApiConfig | Yes | API 配置 |

**PolicyConfig**:
```typescript
{
  levels: {
    "0": {
      statsUserUplink: boolean;
      statsUserDownlink: boolean;
    }
  };
  system: {
    statsInboundUplink: boolean;
    statsInboundDownlink: boolean;
  };
}
```

**ApiConfig**:
```typescript
{
  tag: string;           // "api"
  services: string[];    // ["StatsService"]
}
```

---

## Relationships

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │  TrafficQuota   │
│  (Xray Config)  │◄──────│ (quota.json)    │
│                 │  1:1  │                 │
│  - id (UUID)    │       │  - quotaBytes   │
│  - email ───────┼───────│  - usedBytes    │
│  - level        │       │  - status       │
└─────────────────┘       └─────────���───────┘
        │                         │
        │                         │
        ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  TrafficUsage   │       │  UserWithQuota  │
│  (Xray Stats)   │──────►│   (Runtime)     │
│                 │       │                 │
│  - uplink       │       │  - user         │
│  - downlink     │       │  - quota        │
│  - total        │       │  - usage        │
└─────────────────┘       │  - alertLevel   │
                          └─────────────────┘
```

**Relationship Notes**:
- User 和 TrafficQuota 通过 `email` 字段关联（1:1）
- TrafficUsage 是运行时数据，从 Xray Stats API 实时获取
- UserWithQuota 是聚合视图，用于 UI 显示

---

## State Transitions

### TrafficQuota.status

```
                    ┌──────────────┐
                    │   active     │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │  warning  │  │ exceeded  │  │ disabled  │
    │  (>=80%)  │  │ (>=100%)  │  │  (manual) │
    └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
          │              │              │
          │              ▼              │
          │      ┌───────────┐          │
          └─────►│ disabled  │◄─────────┘
                 │(auto/manual)│
                 └─────┬─────┘
                       │
                       ▼ (admin re-enable)
                 ┌───────────┐
                 │  active   │
                 └───────────┘
```

**Transition Rules**:
1. `active` → `warning`: usedBytes >= quotaBytes * 0.8
2. `active` → `exceeded`: usedBytes >= quotaBytes
3. `exceeded` → `disabled`: 自动禁用（移除用户）
4. `disabled` → `active`: 管理员手动重新启用
5. `active` → `disabled`: 管理员手动禁用

---

## TypeScript Definitions

```typescript
// src/types/quota.ts

/**
 * 流量配额类型
 */
export type QuotaType = 'limited' | 'unlimited';

/**
 * 配额状态
 */
export type QuotaStatus = 'active' | 'disabled' | 'exceeded';

/**
 * 警告级别
 */
export type AlertLevel = 'normal' | 'warning' | 'exceeded';

/**
 * 流量配额
 */
export interface TrafficQuota {
  quotaBytes: number;
  quotaType: QuotaType;
  usedBytes: number;
  lastReset: string;
  status: QuotaStatus;
}

/**
 * 流量使用情况
 */
export interface TrafficUsage {
  email: string;
  uplink: number;
  downlink: number;
  total: number;
  queriedAt: string;
}

/**
 * 带配额的用户
 */
export interface UserWithQuota {
  id: string;
  email: string;
  quota: TrafficQuota;
  usage?: TrafficUsage;
  usagePercent?: number;
  alertLevel?: AlertLevel;
}

/**
 * 配额配置文件
 */
export interface QuotaConfig {
  version: string;
  apiPort: number;
  users: Record<string, TrafficQuota>;
}

/**
 * 配额设置参数
 */
export interface SetQuotaParams {
  email: string;
  quotaBytes: number;
  quotaType: QuotaType;
}

/**
 * 流量单位
 */
export type TrafficUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

/**
 * 格式化的流量值
 */
export interface FormattedTraffic {
  value: number;
  unit: TrafficUnit;
  display: string;
}
```

---

## Default Values

| Entity | Field | Default Value |
|--------|-------|---------------|
| TrafficQuota | quotaBytes | -1 (无限制) |
| TrafficQuota | quotaType | 'unlimited' |
| TrafficQuota | usedBytes | 0 |
| TrafficQuota | status | 'active' |
| QuotaConfig | version | '1.0' |
| QuotaConfig | apiPort | 10085 |

