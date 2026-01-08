# CLI Contracts: Xray 服务管理工具

**Feature**: npm-installable CLI tool for Xray service management
**Date**: 2026-01-07
**Phase 1**: Contract Definitions
**Input**: [spec.md](../spec.md), [data-model.md](../data-model.md)

---

## Overview

本目录定义 Xray 服务管理 CLI 工具的所有命令接口合约，包括：

1. **命令结构**: 主命令和子命令的层级结构
2. **参数规范**: 必需参数、可选参数及其验证规则
3. **输出格式**: 标准输出、错误输出、JSON 格式输出
4. **退出代码**: 成功/失败的标准化退出代码
5. **示例用法**: 每个命令的使用示例

---

## Command Structure (命令结构)

### 全局命令
```bash
xray-manager [command] [options]
xm [command] [options]  # 简写别名
```

### 命令层级
```
xray-manager
├── (无参数)          # 启动交互式菜单（默认行为）
├── service          # 服务管理
│   ├── start
│   ├── stop
│   ├── restart
│   ├── status
│   ├── enable
│   └── disable
├── user             # 用户管理
│   ├── list
│   ├── add
│   ├── delete
│   └── show
├── config           # 配置管理
│   ├── show
│   ├── backup
│   ├── restore
│   └── validate
├── logs             # 日志查看
│   ├── view
│   └── follow
├── --version        # 版本信息
└── --help           # 帮助信息
```

---

## Contract Files (合约文件)

| 文件 | 描述 |
|------|------|
| [01-interactive-menu.md](./01-interactive-menu.md) | 交互式菜单合约 |
| [02-service-commands.md](./02-service-commands.md) | 服务管理命令合约 |
| [03-user-commands.md](./03-user-commands.md) | 用户管理命令合约 |
| [04-config-commands.md](./04-config-commands.md) | 配置管理命令合约 |
| [05-logs-commands.md](./05-logs-commands.md) | 日志查看命令合约 |
| [06-global-options.md](./06-global-options.md) | 全局选项和标志 |
| [07-exit-codes.md](./07-exit-codes.md) | 标准化退出代码 |

---

## Global Options (全局选项)

所有命令都支持以下全局选项：

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--config <path>` | `-c` | 指定配置文件路径 | `/usr/local/etc/xray/config.json` |
| `--service <name>` | `-s` | 指定服务名称 | `xray` |
| `--json` | `-j` | 输出 JSON 格式 | `false` |
| `--verbose` | `-v` | 详细输出 | `false` |
| `--silent` | `-q` | 静默模式（无交互） | `false` |
| `--no-color` | | 禁用颜色输出 | `false` |
| `--help` | `-h` | 显示帮助信息 | - |
| `--version` | `-V` | 显示版本号 | - |

---

## Standard Exit Codes (标准退出代码)

| 代码 | 含义 | 场景 |
|------|------|------|
| `0` | 成功 | 命令执行成功 |
| `1` | 通用错误 | 未分类的错误 |
| `2` | 参数错误 | 无效的命令行参数 |
| `3` | 配置错误 | 配置文件错误或缺失 |
| `4` | 权限错误 | 需要 root/sudo 权限 |
| `5` | 服务错误 | systemd 服务操作失败 |
| `6` | 网络错误 | 网络连接问题 |
| `7` | 文件错误 | 文件读写错误 |
| `130` | 用户中断 | Ctrl+C 中断 |

---

## Output Format Standards (输出格式标准)

### 1. 标准输出（人类可读）

**成功消息**:
```
✅ 服务启动成功
✓ 用户添加成功: user@example.com
```

**错误消息**:
```
❌ 服务启动失败: 端口 443 已被占用

💡 建议:
   1. 检查占用端口的进程: sudo lsof -i :443
   2. 停止冲突的服务或修改端口配置
```

**进度显示**:
```
⏳ 正在下载 Xray 核心文件...
🔄 正在重启服务...
⏱️  预计中断时间: 5-10 秒
```

### 2. JSON 输出（`--json` 标志）

```json
{
  "success": true,
  "data": {
    "serviceName": "xray",
    "active": true,
    "uptime": "2天 3小时 15分钟",
    "memory": "45.2 MB"
  },
  "timestamp": "2026-01-07T10:30:45.123Z"
}
```

**错误 JSON**:
```json
{
  "success": false,
  "error": "端口 443 已被占用",
  "code": "SERVICE_ERROR",
  "suggestions": [
    "检查占用端口的进程: sudo lsof -i :443",
    "停止冲突的服务或修改端口配置"
  ],
  "timestamp": "2026-01-07T10:30:45.123Z"
}
```

---

## Testing Contracts (测试合约)

每个合约文件都应包含：

1. **请求示例**: 完整的命令行调用示例
2. **响应示例**: 成功和失败场景的输出示例
3. **验证规则**: 参数验证规则和错误消息
4. **边界情况**: 特殊情况和边界条件处理

---

## Constitution Compliance (宪章合规性)

### ✅ II. 简洁易用 (CR-002)
- **清晰的命令结构**: 直观的层级结构，易于记忆
- **双语输出**: 所有输出支持中英文
- **友好的错误提示**: 包含具体建议和解决方案

### ✅ III. 可靠稳定 (CR-003)
- **标准化退出代码**: 便于脚本自动化
- **JSON 输出选项**: 支持程序化调用
- **详细错误信息**: 帮助快速定位问题

### ✅ V. 文档完整 (CR-005)
- **完整的合约定义**: 每个命令都有详细规范
- **示例用法**: 所有命令都有使用示例
- **参数说明**: 所有参数都有清晰描述

---

**最后更新**: 2026-01-07
**状态**: ✅ 已完成
