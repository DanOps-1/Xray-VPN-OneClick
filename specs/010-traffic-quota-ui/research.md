# Research: 流量配额管理与 UI 增强

**Feature**: 010-traffic-quota-ui
**Date**: 2026-01-14
**Status**: Complete

## Research Tasks

### RT-001: Xray Stats API 集成方式

**Decision**: 使用 Shell 命令执行方式调用 `xray api` 命令

**Rationale**:
- 项目已有成熟的 shell 命令执行模式（参考 `systemd-manager.ts`）
- 避免引入额外的 gRPC 依赖
- 简化部署和维护
- 对于实时查询（每次打开/刷新界面）的场景，性能足够

**Alternatives Considered**:
1. **gRPC 直接调用** - 需要引入 protobuf 和 gRPC 依赖，增加复杂度
2. **定期采集存储** - 需要后台进程，不符合 CLI 工具的简单性原则

---

### RT-002: Xray 配置启用统计功能

**Decision**: 需要在 Xray config.json 中添加 `stats`、`policy` 和 `api` 配置

**Required Config Structure**:
```json
{
  "stats": {},
  "policy": {
    "levels": {
      "0": {
        "statsUserUplink": true,
        "statsUserDownlink": true
      }
    },
    "system": {
      "statsInboundUplink": true,
      "statsInboundDownlink": true
    }
  },
  "api": {
    "tag": "api",
    "services": ["StatsService"]
  },
  "inbounds": [
    {
      "tag": "api",
      "port": 10085,
      "listen": "127.0.0.1",
      "protocol": "dokodemo-door",
      "settings": {
        "address": "127.0.0.1"
      }
    }
  ],
  "routing": {
    "rules": [
      {
        "inboundTag": ["api"],
        "outboundTag": "api",
        "type": "field"
      }
    ]
  },
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "api"
    }
  ]
}
```

**Key Points**:
- 用户必须有 `email` 字段才能统计流量
- API 端口默认使用 10085，仅监听 127.0.0.1
- 需要添加 dokodemo-door inbound 用于 API 访问

---

### RT-003: 流量统计数据格式

**Decision**: 使用 Xray 标准命名格式解析流量数据

**Stats Naming Convention**:
```
user>>>{email}>>>traffic>>>uplink    # 用户上行流量（字节）
user>>>{email}>>>traffic>>>downlink  # 用户下行流量（字节）
```

**Query Commands**:
```bash
# 查询单个用户流量
xray api stats --server=127.0.0.1:10085 -name "user>>>user@example.com>>>traffic>>>uplink"

# 查询所有统计（不重置）
xray api statsquery --server=127.0.0.1:10085

# 查询并重置统计
xray api statsquery --server=127.0.0.1:10085 -reset
```

**Output Format** (JSON):
```json
{
  "stat": [
    {
      "name": "user>>>user@example.com>>>traffic>>>uplink",
      "value": 1234567890
    },
    {
      "name": "user>>>user@example.com>>>traffic>>>downlink",
      "value": 9876543210
    }
  ]
}
```

---

### RT-004: 流量配额数据存储

**Decision**: 使用独立的 JSON 配置文件存储配额数据

**Rationale**:
- 与 Xray 配置分离，避免修改核心配置
- 简单的文件存储，无需数据库
- 易于备份和迁移

**Storage Location**: `/usr/local/etc/xray/quota.json`

**Data Structure**:
```json
{
  "version": "1.0",
  "users": {
    "user@example.com": {
      "quotaBytes": 10737418240,
      "quotaType": "limited",
      "usedBytes": 0,
      "lastReset": "2026-01-14T00:00:00Z",
      "status": "active"
    }
  }
}
```

---

### RT-005: 流量单位转换

**Decision**: 使用标准 IEC 二进制单位（1 GB = 1024^3 bytes）

**Conversion Table**:
| 单位 | 字节数 |
|------|--------|
| KB | 1,024 |
| MB | 1,048,576 |
| GB | 1,073,741,824 |
| TB | 1,099,511,627,776 |

**Display Format**:
- 自动选择最合适的单位
- 保留 2 位小数
- 示例: `1.25 GB`, `512.00 MB`, `2.50 TB`

---

### RT-006: 配额超限自动禁用机制

**Decision**: 通过修改 Xray 配置文件移除用户实现禁用

**Implementation Approach**:
1. 查询流量时检查是否超过配额
2. 超过配额时，从 Xray config.json 的 clients 数组中移除用户
3. 重启 Xray 服务使配置生效
4. 在 quota.json 中标记用户状态为 `disabled`
5. 管理员可手动重新启用（恢复用户到 config.json）

**Rationale**:
- Xray 本身不支持流量限制功能
- 移除用户是最可靠的禁用方式
- 保留用户数据便于恢复

---

### RT-007: 现有代码架构分析

**Current Structure**:
```
src/
├── cli.ts                    # CLI 入口
├── commands/
│   ├── interactive.ts        # 交互式菜单
│   ├── user.ts              # 用户管理命令
│   └── service.ts           # 服务管理命令
├── services/
│   ├── user-manager.ts      # 用户管理服务
│   ├── config-manager.ts    # 配置管理服务
│   └── systemd-manager.ts   # Systemd 服务管理
├── types/
│   ├── user.ts              # 用户类型定义
│   └── config.ts            # 配置类型定义
└── utils/
    └── logger.ts            # 日志工具
```

**Integration Points**:
1. **新增服务**: `traffic-manager.ts` - 流量统计和配额管理
2. **扩展类型**: `user.ts` - 添加流量配额相关字段
3. **扩展命令**: `user.ts` - 添加流量查看和配额设置功能
4. **扩展菜单**: `interactive.ts` - 添加流量管理菜单项

---

### RT-008: UI 组件库选择

**Decision**: 继续使用现有的 @inquirer/prompts + chalk 组合

**Rationale**:
- 项目已使用这些库，保持一致性
- 功能足够满足需求
- 避免引入新依赖

**UI Enhancements**:
- 使用 `cli-table3` 显示流量统计表格（已有依赖）
- 使用 chalk 颜色标记配额状态（绿/黄/红）
- 使用进度条显示配额使用百分比

---

## Dependencies

| 依赖 | 版本 | 用途 | 状态 |
|------|------|------|------|
| @inquirer/prompts | ^8.1.0 | 交互式提示 | 已有 |
| chalk | ^4.1.2 | 终端颜色 | 已有 |
| cli-table3 | ^0.6.5 | 表格显示 | 已有 |
| commander | ^14.0.2 | CLI 框架 | 已有 |

**无需新增依赖**

---

## Risks & Mitigations

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Xray 未启用 stats | 无法获取流量数据 | 检测并提示用户启用，提供自动配置选项 |
| API 端口冲突 | 无法查询统计 | 允许配置自定义端口 |
| 配额文件损坏 | 数据丢失 | 自动备份，启动时验证 |
| 服务重启失败 | 用户无法连接 | 配置修改前备份，失败时回滚 |

---

## Next Steps

1. 生成 `data-model.md` - 定义数据模型
2. 生成 `contracts/` - 定义内部 API 接口
3. 生成 `quickstart.md` - 开发快速入门指南
