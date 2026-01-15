# Data Model: 核心功能完善

**Feature**: 012-core-features-completion
**Date**: 2026-01-15

## Entities

### 1. ServerConfig

服务器配置信息，用于存储公网 IP 和相关网络设置。

**Storage**: `/usr/local/etc/xray/server-config.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| publicIp | string | Yes | 服务器公网 IP 地址 |
| lastUpdated | string (ISO8601) | Yes | 最后更新时间 |
| source | 'auto' \| 'manual' | Yes | IP 来源：自动检测或手动输入 |
| port | number | No | 服务端口（可选，默认从 Xray 配置读取） |

**Validation Rules**:
- `publicIp`: 必须是有效的 IPv4 或 IPv6 地址
- `lastUpdated`: 必须是有效的 ISO8601 时间戳
- `source`: 只能是 'auto' 或 'manual'

**Example**:
```json
{
  "publicIp": "203.0.113.50",
  "lastUpdated": "2026-01-15T10:30:00.000Z",
  "source": "auto"
}
```

---

### 2. UserMetadata

用户元数据，存储用户创建时间和状态历史。

**Storage**: `/usr/local/etc/xray/user-metadata.json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| users | Record<string, UserMeta> | Yes | 用户元数据映射，key 为用户 UUID |

**UserMeta 子结构**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| createdAt | string (ISO8601) | Yes | 用户创建时间 |
| status | 'active' \| 'disabled' \| 'exceeded' | Yes | 用户当前状态 |
| statusChangedAt | string (ISO8601) | No | 状态最后变更时间 |

**Validation Rules**:
- `users` key: 必须是有效的 UUID v4 格式
- `createdAt`: 必须是有效的 ISO8601 时间戳
- `status`: 只能是 'active', 'disabled', 或 'exceeded'

**State Transitions**:
```
active → disabled (手动禁用)
active → exceeded (配额超限)
disabled → active (手动启用)
exceeded → active (重置配额或重新启用)
```

**Example**:
```json
{
  "users": {
    "550e8400-e29b-41d4-a716-446655440000": {
      "createdAt": "2026-01-10T08:00:00.000Z",
      "status": "active",
      "statusChangedAt": "2026-01-10T08:00:00.000Z"
    },
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8": {
      "createdAt": "2026-01-12T14:30:00.000Z",
      "status": "exceeded",
      "statusChangedAt": "2026-01-15T09:00:00.000Z"
    }
  }
}
```

---

### 3. LogEntry

日志条目，用于日志查看功能的数据结构。

**Storage**: 内存中（从日志文件读取）

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timestamp | string | Yes | 日志时间戳 |
| level | 'info' \| 'warning' ' | No | 日志级别（如果可解析） |
| content | string | Yes | 日志内容 |
| lineNumber | number | Yes | 原始文件行号 |

**Note**: 日志格式由 Xray 决定，此结构用于内部处理和显示。

---

### 4. ConfigBackup

配置备份元数据。

**Storage**: `/var/backups/xray/` 目录下的 JSON 文件

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| filename | string | Yes | 备份文件名 |
| filepath | string | Yes | 备份文件完整路径 |
| createdAt | string (ISO8601) | Yes | 备份创建时间 |
| size | number | Yes | 文件大小（字节） |

**Naming Convention**: `config-backup-YYYYMMDD-HHmmss.json`

---

## Relationships

```
┌─────────────────┐
│  ServerConfig   │
│  (server-config │
│   .json)        │
└────────┬────────┘
         │ provides publicIp for
         ▼
┌─────────────────┐      references      ┌─────────────────┐
│  UserManager    │◄────────────────────►│  UserMetadata   │
│  (user-manager  │                      │  (user-metadata │
│   .ts)          │                      │   .json)        │
└────────┬────────┘                      └─────────────────┘
         │ generates
         ▼
┌─────────────────┐
│  Share Link     │
│  (vless://...)  │
└─────────────────┘

┌─────────────────┐      reads/writes    ┌─────────────────┐
│  ConfigManager  │◄────────────────────►│  ConfigBackup   │
│  (config-manager│                      │  (/var/backups/ │
│   .ts)          │                      │   xray/)        │
└─────────────────┘                      └─────────────────┘

┌─────────────────┐      reads           ┌─────────────────┐
│  LogManager     │◄─────────────────────│  Log Files      │
│  (log-manager   │                      │  (/var/log/     │
│   .ts)          │                      │   xray/)        │
└────────┬────────┘                      └─────────────────┘
         │ returns
         ▼
┌─────────────────┐
│  LogEntry[]     │
└─────────────────┘
```

---

## File Paths Summary

| Entity | Path | Permissions |
|--------|------|-------------|
| ServerConfig | `/usr/local/etc/xray/server-config.json` | 644 |
| UserMetadata | `/usr/local/etc/xray/user-metadata.json` | 644 |
| ConfigBackup | `/var/backups/xray/config-backup-*.json` | 644 |
| Access Log | `/var/log/xray/access.log` | 644 (read-only) |
| Error Log | `/var/log/xray/error.log` | 644 (read-only) |
