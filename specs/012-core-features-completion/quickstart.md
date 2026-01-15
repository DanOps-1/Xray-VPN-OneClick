# Quickstart: 核心功能完善

**Feature**: 012-core-features-completion
**Date**: 2026-01-15

## 概述

本功能完善 Xray VPN Manager CLI 的核心缺失功能，使工具功能完整可用。

## 新增功能

### 1. 公网 IP 自动检测

生成分享链接时自动获取服务器公网 IP：

```bash
# 分享链接现在包含实际的公网 IP
xray-manager user share <user-email>
# 输出: vless://uuid@203.0.113.50:443?...
```

NAT 环境下首次使用会提示输入公网 IP：
```
检测到 NAT 环境 (私有 IP: 192.168.1.100)
请输入公网 IP 地址: _
```

### 2. 日志查看

从主菜单选择"查看日志"进入日志查看子菜单：

```
[日志] 查看日志
  ├── [访问] 查看访问日志
  ├── [错误] 查看错误日志
  └── [返回] 返回主菜单
```

显示最近 50 行日志，支持语法高亮。

### 3. 配置管理

从主菜单选择"配置管理"进入配置管理子菜单：

```
[配置] 配置管理
  ├── [查看] 查看当前配置
  ├── [备份] 备份配置
  ├── [恢复] 恢复配置
  └── [返回] 返回主菜单
```

备份文件存储在 `/var/backups/xray/`。

### 4. 用户元数据持久化

用户创建时间和状态现在正确保存：

```bash
# 用户列表显示准确的创建时间
xray-manager user list
# 输出包含: 创建时间: 2026-01-10 08:00:00
```

### 5. 配额执行

在配额管理菜单中新增"执行配额检查"选项：

```
[配额] 流量配额管理
  ├── [列表] 查看配额列表
  ├── [设置] 设置用户配额
  ├── [检查] 执行配额检查  ← 新增
  └── ...
```

执行后显示摘要：
```
配额检查完成
- 正常用户: 8
- 警告用户: 2
- 超限用户: 1 (已禁用)
```

## 新增文件

| 文件 | 描述 |
|------|------|
| `src/services/public-ip-manager.ts` | 公网 IP 检测与缓存服务 |
| `src/services/user-metadata-manager.ts` | 用户元数据持久化服务 |
| `src/types/server-config.ts` | 服务器配置类型定义 |
| `src/types/user-metadata.ts` | 用户元数据类型定义 |

## 修改文件

| 文件 | 修改内容 |
|------|----------|
| `src/commands/interactive.ts` | 连接日志和配置菜单 |
| `src/commands/logs.ts` | 实现日志查看子菜单 |
| `src/commands/config.ts` | 实现配置管理子菜单 |
| `src/commands/quota.ts` | 添加配额执行选项 |
| `src/services/user-manager.ts` | 集成公网 IP 和元数据 |
| `src/constants/paths.ts` | 添加新配置文件路径 |
| `src/utils/network.ts` | 添加公网 IP 检测函数 |
| `src/config/i18n.ts` | 添加新功能的翻译 |

## 配置文件

新增两个配置文件：

### /usr/local/etc/xray/server-config.json
```json
{
  "publicIp": "203.0.113.50",
  "lastUpdated": "2026-01-15T10:30:00.000Z",
  "source": "auto"
}
```

### /usr/local/etc/xray/user-metadata.json
```json
{
  "users": {
    "550e8400-e29b-41d4-a716-446655440000": {
      "createdAt": "2026-01-10T08:00:00.000Z",
      "status": "active"
    }
  }
}
```

## 测试

运行测试：
```bash
npm test
```

新增测试文件：
- `tests/unit/services/public-ip-manager.test.ts`
- `tests/unit/services/user-metadata-manager.test.ts`
- `tests/unit/commands/logs.test.ts`
- `tests/unit/commands/config.test.ts`
- `tests/integration/share-link.test.ts`
- `tests/integration/config-management.test.ts`

## 验收标准

- [ ] 分享链接包含有效的公网 IP（非 "your-server-ip"）
- [ ] 日志查看菜单可正常进入和显示日志
- [ ] 配置管理菜单可���常备份和恢复配置
- [ ] 用户创建时间在重启后保持不变
- [ ] 配额检查可正确识别并禁用超限用户
- [ ] 主菜单不再显示"功能即将推出"
