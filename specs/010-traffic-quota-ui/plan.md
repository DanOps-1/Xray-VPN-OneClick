# Implementation Plan: 流量配额管理与 UI 增强

**Branch**: `010-traffic-quota-ui` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-traffic-quota-ui/spec.md`

## Summary

为 Xray VPN 管理 CLI 工具添加流量配额管理功能，包括：
- 为每个用户分配和管理流量配额
- 实时查看用户流量使用情况
- 流量超限自动禁用用户
- 改进的仪表盘和用户界面

技术方案：通过 Xray Stats API 获取流量统计，使用独立 JSON 文件存储配额配置。

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: @inquirer/prompts, commander, chalk, cli-table3
**Storage**: JSON 文件 (`/usr/local/etc/xray/quota.json`)
**Testing**: Vitest
**Target Platform**: Linux (Debian/Ubuntu, RHEL/Fedora)
**Project Type**: Single CLI project
**Performance Goals**: 界面加载 < 2 秒
**Constraints**: 无需新增依赖
**Scale/Scope**: 支持数十个用户的流量管理

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| 无新依赖 | ✅ Pass | 使用现有依赖 |
| 测试覆盖 | ✅ Pass | 使用 Vitest |
| 代码风格 | ✅ Pass | 遵循现有 TypeScript 规范 |

## Project Structure

### Documentation (this feature)

```text
specs/010-traffic-quota-ui/
├── spec.md              # 功能规格
├── plan.md              # 本文件
├── research.md          # 研究文档
├── data-model.md        # 数据模型
├── quickstart.md        # 快速入门
├── contracts/           # 接口定义
│   └── services.md
└── tasks.md             # 任务列表（由 /speckit.tasks 生成）
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── quota.ts         # [新增] 流量配额类型
│   └── user.ts          # [修改] 扩展用户类型
├── services/
│   ├── traffic-manager.ts   # [新增] 流量统计服务
│   ├── quota-manager.ts     # [新增] 配额管理服务
│   └── user-manager.ts      # [修改] 集成配额检查
├── commands/
│   ├── quota.ts         # [新增] 配额管理命令
│   ├── user.ts          # [修改] 添加流量显示
│   └── interactive.ts   # [修改] 添加配额菜单
├── utils/
│   └── traffic-formatter.ts # [新增] 流量格式化
└── components/
    └── dashboard-widget.ts  # [修改] 添加流量概览

tests/
├── unit/
│   ├── traffic-manager.test.ts
│   ├── quota-manager.test.ts
│   └── traffic-formatter.test.ts
└── integration/
    └── quota-flow.test.ts
```

**Structure Decision**: 使用现有单项目结构，新增文件遵循现有目录组织。

## Complexity Tracking

> 无违规项，无需填写。

---

## Generated Artifacts

| 文件 | 状态 |
|------|------|
| [research.md](./research.md) | ✅ 完成 |
| [data-model.md](./data-model.md) | ✅ 完成 |
| [contracts/services.md](./contracts/services.md) | ✅ 完成 |
| [quickstart.md](./quickstart.md) | ✅ 完成 |

## Next Steps

运行 `/speckit.tasks` 生成任务列表。
