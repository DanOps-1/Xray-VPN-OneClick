# Implementation Plan: 自动启用 Xray Stats API

**Branch**: `011-auto-stats-api` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-auto-stats-api/spec.md`

## Summary

实现自动检测和配置 Xray Stats API 功能。当用户使用流量配额管理功能时，如果检测到 Stats API 未启用，系统将提示用户并提供一键自动配置选项。配置过程包括备份原配置、添加必要的 stats/api/routing 配置、重启服务，以及失败时自动回滚。

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: @inquirer/prompts, chalk, ora (已有依赖)
**Storage**: JSON 文件 (`/usr/local/etc/xray/config.json`)
**Testing**: Vitest (已配置，80% 覆盖率要求)
**Target Platform**: Linux (systemd)
**Project Type**: Single CLI application
**Performance Goals**: 配置流程 < 30 秒完成
**Constraints**: 需要 root 权限，配置修改必须可回滚
**Scale/Scope**: 单机部署

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

项目 constitution 为模板状态，无特定约束。遵循现有代码模式：
- ✅ 服务类模式 (Service Class Pattern)
- ✅ 错误处理模式 (Error Handling Pattern)
- ✅ 配置文件安全权限 (0o600)
- ✅ 备份/恢复机制 (ConfigManager 已有)
- ✅ 单元测试覆盖

## Project Structure

### Documentation (this feature)

```text
specs/011-auto-stats-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── stats-config-manager.ts    # NEW: Stats API 配置管理服务
│   ├── traffic-manager.ts         # MODIFY: 添加自动配置提示
│   └── config-manager.ts          # EXISTING: 复用备份/恢复功能
├── commands/
│   ├── quota.ts                   # MODIFY: 集成自动配置流程
│   └── interactive.ts             # MODIFY: 添加菜单选项
├── types/
│   └── config.ts                  # MODIFY: 添加 Stats/API 类型
└── constants/
    └── quota.ts                   # MODIFY: 添加 Stats 配置常量

tests/
├── unit/
│   └── services/
│       └── stats-config-manager.test.ts  # NEW
└── integration/
    └── stats-api-setup.test.ts           # NEW
```

**Structure Decision**: 遵循现有单项目结构，新增 `StatsConfigManager` 服务类处理 Stats API 配置逻辑。

## Complexity Tracking

无违规项，设计遵循现有模式。
