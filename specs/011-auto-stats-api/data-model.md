# Data Model: 自动启用 Xray Stats API

**Feature**: 011-auto-stats-api
**Date**: 2026-01-14

## 1. 核心实体

### 1.1 StatsConfig (Stats 配置)

启用 Xray 流量统计功能的配置块。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| (空对象) | object | 是 | 空对象即可启用统计功能 |

**示例**:
```json
{
  "stats": {}
}
```

---

### 1.2 ApiConfig (API 配置)

定义 Xray API 服务的配置块。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tag | string | 是 | API 标签，用于路由引用，默认 "api" |
| services | string[] | 是 | 启用的 API 服务列表 |

**services 可选值**:
- `StatsService` - 流量统计服务 (必需)
- `HandlerService` - 动态配置服务
- `LoggerService` - 日志服务
- `RoutingService` - 路由服务

**示例**:
```json
{
  "api": {
    "tag": "api",
    "services": ["StatsService"]
  }
}
```

---

### 1.3 ApiInbound (API 入站配置)

用于接收 Stats API 请求的入站连接配置。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tag | string | 是 | 入站标签，必须与 api.tag 匹配 |
| port | number | 是 | 监听端口，默认 10085 |
| listen | string | 是 | 监听地址，必须为 "127.0.0.1" |
| protocol | string | 是 | 协议类型，必须为 "dokodemo-door" |
| settings.address | string | 是 | 目标地址，设为 "127.0.0.1" |

**示例**:
```json
{
  "tag": "api",
  "port": 10085,
  "listen": "127.0.0.1",
  "protocol": "dokodemo-door",
  "settings": {
    "address": "127.0.0.1"
  }
}
```

---

### 1.4 ApiRoutingRule (API 路由规��)

将 API 入站流量路由到 API 处理器的规则。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 规则类型，固定为 "field" |
| inboundTag | string[] | 是 | 匹配的入站标签列表 |
| outboundTag | string | 是 | 目标出站标签，必须为 "api" |

**示例**:
```json
{
  "type": "field",
  "inboundTag": ["api"],
  "outboundTag": "api"
}
```

---

### 1.5 StatsDetectionResult (检测结果)

Stats API 配置检测的结果对象。

| 字段 | 类型 | 说明 |
|------|------|------|
| available | boolean | API 是否可用（可连接） |
| configDetected | boolean | 配置文件中是否检测到 stats 配置 |
| detectedPort | number? | 检测到的 API 端口 |
| serviceRunning | boolean | Xray 服务是否运行 |
| message | string | 状态描述消息 |
| suggestion | string? | 建议操作 |
| missingComponents | string[] | 缺失的配置组件列表 |

**missingComponents 可能值**:
- `"stats"` - 缺少 stats 配置块
- `"api"` - 缺少 api 配置块
- `"api-inbound"` - 缺少 API 入站配置
- `"api-routing"` - 缺少 API 路由规则

---

### 1.6 StatsConfigResult (配置结果)

自动配置操作的结果对象。

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 配置是否成功 |
| backupPath | string? | 备份文件路径 |
| apiPort | number | 配置的 API 端口 |
| message | string | 结果消息 |
| error | string? | 错误信息（如果失败） |
| rolledBack | boolean | 是否已回滚 |

---

## 2. 状态转换

### 2.1 Stats API 状态

```
┌─────────────────┐
│   未配置        │ ──检测──> 提示用户配置
│ (not_configured)│
└────────┬────────┘
         │ 用户确认
         ▼
┌─────────────────┐
│   配置中        │ ──失败──> 回滚 ──> 未配置
│ (configuring)   │
└────────┬────────┘
         │ 成功
         ▼
┌─────────────────┐
│   已配置        │ ──验证──> 可用/不可用
│ (configured)    │
└────────┬────────┘
         │ API 连接成功
         ▼
┌─────────────────┐
│   可用          │
│ (available)     │
└─────────────────┘
```

---

## 3. 验证规则

### 3.1 端口验证
- 范围: 1-65535
- 默认: 10085
- 约束: 不能与现有 inbound 端口冲突

### 3.2 配置完整性验证
- `stats` 必须存在（可为空对象）
- `api.tag` 必须与 api inbound 的 tag 匹配
- `api.services` 必须包含 "StatsService"
- api inbound 必须监听 127.0.0.1
- routing rules 必须包含 api 路由规则

### 3.3 服务状态验证
- Xray 服务必须处于 active 状态
- Stats API 必须可连接（`xray api statsquery` 成功）

---

## 4. 关系图

```
┌─────────────────────────────────────────────────────────────┐
│                     XrayConfig                               │
├─────────────────────────────────────────────────────────────┤
│  stats: StatsConfig                                          │
│  api: ApiConfig ─────────────────┐                          │
│  inbounds: Inbound[] ────────────┼──> ApiInbound            │
│  routing: RoutingConfig ─────────┼──> ApiRoutingRule        │
│  outbounds: Outbound[]           │                          │
└──────────────────────────────────┴──────────────────────────┘
                                   │
                                   │ tag 匹配
                                   ▼
                    ┌──────────────────────────┐
                    │  api.tag = "api"         │
                    │  inbound.tag = "api"     │
                    │  routing.outboundTag = "api" │
                    └──────────────────────────┘
```

---

## 5. 默认值

```typescript
const DEFAULT_STATS_CONFIG = {
  stats: {},
  api: {
    tag: 'api',
    services: ['StatsService'],
  },
  apiInbound: {
    tag: 'api',
    port: 10085,
    listen: '127.0.0.1',
    protocol: 'dokodemo-door',
    settings: {
      address: '127.0.0.1',
    },
  },
  apiRoutingRule: {
    type: 'field',
    inboundTag: ['api'],
    outboundTag: 'api',
  },
};
```
