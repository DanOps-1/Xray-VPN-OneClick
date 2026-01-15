# Implementation Plan: 核心功能完善

**Branch**: `012-core-features-completion` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-core-features-completion/spec.md`

## Summary

完善 Xray VPN Manager CLI 工具的核心缺失功能，包括：公网 IP 自动检测与分享链接生成、日志查看菜单、配置管理菜单、用户元数据持久化、以及配额执行菜单集成。这些功能将填补当前"功能即将推出"的占位符，使工具功能完整可用。

## Technical Context

**Language/Version**: TypeScript 5.9.x (Node.js >= 18.0.0)
**Primary Dependencies**: @inquirer/prompts, commander, chalk, cli-table3, ora
**Storage**: JSON 文件 (`/usr/local/etc/xray/config.json`, `/usr/local/etc/xray/quota.json`, 新增 `server-config.json`, `user-metadata.json`)
**Testing**: Vitest 4.x (单元测试 + 集成测试)
**Target Platform**: Linux 服务器 (Debian/RHEL 系列)
**Project Type**: Single CLI 项目
**Performance Goals**: 配额检查 100 用户 < 3 秒，菜单响应 < 5 秒
**Constraints**: 公网 IP 检测超时 3 秒，重试 1 次；日志显示限制 50 行
**Scale/Scope**: 单服务器部署，支持 100+ 用户管理

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| 使用现有服务层架构 | ✅ PASS | 复用 log-manager, config-manager, quota-enforcer |
| 遵循现有代码风格 | ✅ PASS | TypeScript strict mode, ESLint 规则 |
| 测试覆盖要求 | ✅ PASS | 新功能需配套单元测试和集成测试 |
| 无破坏性变更 | ✅ PASS | 仅添加新功能，不修改现有 API |

## Project Structure

### Documentation (this feature)

```text
specs/012-core-features-completion/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal service contracts)
│   └── services.md      # Service interface definitions
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── commands/
│   ├── interactive.ts   # [MODIFY] 连接日志和配置菜单
│   ├── logs.ts          # [MODIFY] 实现日志查看功能
│   ├── config.ts        # [MODIFY] 实现配置管理功能
│   └── quota.ts         # [MODIFY] 添加配额执行选项
├── services/
│   ├── public-ip-manager.ts    # [NEW] 公网 IP 检测与缓存
│   ├── user-metadata-manager.ts # [NEW] 用户元数据持久化
│   ├── user-manager.ts         # [MODIFY] 集成公网 IP 和元数据
│   ├── log-manager.ts          # [EXISTS] 已有，需连接到菜单
│   ├── config-manager.ts       # [EXISTS] 已有，需连接到菜单
│   └── quota-enforcer.ts       # [EXISTS] 已有，需连接到菜单
├── types/
│   ├── server-config.ts  # [NEW] 服务器配置类型
│   └── user-metadata.ts  # [NEW] 用户元数据类型
├── constants/
│   └── paths.ts          # [MODIFY] 添加新配置文件路径
└── utils/
    └── network.ts        # [MODIFY] 添加公网 IP 检测函数

tests/
├── unit/
│   ├── services/
│   │   ├── public-ip-manager.test.ts  # [NEW]
│   │   └── user-metadata-manager.test.ts # [NEW]
│   └── commands/
│       ├── logs.test.ts    # [NEW]
│       └── config.test.ts  # [NEW]
└── integration/
    ├── log-viewing.test.ts      # [MODIFY] 扩展测试
    ├── config-management.test.ts # [NEW]
    └── share-link.test.ts       # [NEW]
```

**Structure Decision**: 使用现有的单项目结构，新增服务放在 `src/services/`，新增类型放在 `src/types/`，遵循现有的模块化架构。

## Complexity Tracking

> 无违规需要说明 - 所有新增内容符合现有架构模式
