# Quickstart: 流量配额管理与 UI 增强

**Feature**: 010-traffic-quota-ui
**Date**: 2026-01-14

## Prerequisites

- Node.js 18+
- Xray 已安装并运行
- 项目已克隆并安装依赖

## Development Setup

```bash
# 1. 切换到功能分支
git checkout 010-traffic-quota-ui

# 2. 安装依赖
npm install

# 3. 运行测试
npm test

# 4. 启动开发模式
npm run dev
```

## Key Files to Modify

### 新增文件

| 文件 | 用途 |
|------|------|
| `src/types/quota.ts` | 流量配额类型定义 |
| `src/services/traffic-manager.ts` | 流量统计服务 |
| `src/services/quota-manager.ts` | 配额管理服务 |
| `src/utils/traffic-formatter.ts` | 流量格式化工具 |
| `src/commands/quota.ts` | 配额管理命令 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `src/types/user.ts` | 扩展 User 类型 |
| `src/commands/user.ts` | 添加流量显示 |
| `src/commands/interactive.ts` | 添加配额菜单 |
| `src/components/dashboard-widget.ts` | 添加流量概览 |

## Testing

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "quota"

# 运行覆盖率
npm run test:coverage
```

## Manual Testing

```bash
# 构建项目
npm run build

# 运行 CLI
./dist/cli.js

# 或使用 npm link
npm link
xray-manager
```
