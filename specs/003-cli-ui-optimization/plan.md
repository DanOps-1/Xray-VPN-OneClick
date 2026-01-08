# Implementation Plan: CLI User Interface Optimization

**Branch**: `003-cli-ui-optimization` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-cli-ui-optimization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

优化 CLI 交互界面，消除 emoji 兼容性问题，提供通用的文本指示符替代方案。核心目标：
1. 替换所有 emoji 字符为 ASCII/基础 Unicode 文本指示符（如 `[OK]`, `[ERROR]`）
2. 确保在 Windows CMD、旧版终端、最小化 SSH 会话中的完美兼容性
3. 改进视觉层次和菜单组织，提升可扫描性
4. 保持 80 列终端宽度兼容性
5. 支持 TTY 检测和无色输出模式

技术方案：重构现有 logger 工具和 interactive menu 组件，引入终端能力检测机制，为所有状态消息和菜单选项提供文本替代方案。

## Technical Context

**Language/Version**: TypeScript 5.9+ / Node.js 18+
**Primary Dependencies**:
- `chalk` 4.1.2 (颜色输出)
- `@inquirer/prompts` 8.1.0 (交互式菜单)
- `commander` 14.0.2 (CLI 框架)
- `ora` 9.0.0 (加载动画)

**Storage**: N/A (无数据存储需求，仅 UI 优化)
**Testing**: Vitest 4.0+ (单元测试和集成测试)
**Target Platform**:
- Linux (Debian/Ubuntu/CentOS/Kali)
- Windows (CMD, PowerShell)
- macOS
- 最小化终端环境 (SSH, PuTTY)

**Project Type**: Single (CLI 工具项目)
**Performance Goals**:
- 启动时间 <2 秒
- 菜单切换响应 <100ms
- 无渲染性能回归

**Constraints**:
- 必须支持 80 列最小终端宽度
- 必须兼容 ASCII 终端
- 必须在 Windows CMD CP437/CP936 编码下正确显示
- 必须支持 TTY 和非 TTY 输出
- 必须保持向后兼容（现有 API 不变）

**Scale/Scope**:
- 影响范围：~10 个文件（logger, interactive, commands/*）
- 约 300-500 行代码修改
- 约 15-20 个 emoji 替换点

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

根据 `.specify/memory/constitution.md` 检查以下核心原则：

### I. 安全第一
- [x] 密钥/UUID 是否自动生成（禁止硬编码）- **N/A**，本功能不涉及密钥生成
- [x] 敏感信息是否正确处理（不记录到日志）- **N/A**，仅 UI 优化，不涉及敏感信息处理
- [x] 配置文件权限是否正确（600）- **N/A**，不涉及配置文件修改
- [x] 用户输入是否经过验证和清理 - **N/A**，不引入新的用户输入点

### II. 简洁易用
- [x] 默认配置是否满足大多数用户需求 - **是**，默认使用文本指示符，无需用户配置
- [x] 是否实现一键部署 - **N/A**，不涉及部署流程
- [x] 错误提示是否清晰（中英文双语）- **是**，保持现有中文提示，优化显示兼容性
- [x] 是否避免不必要的复杂度 - **是**，仅替换 emoji 为文本，不增加新功能

### III. 可靠稳定
- [x] 是否包含错误检测和友好提示 - **是**，保持现有错误处理机制
- [x] 是否支持配置备份和恢复 - **N/A**，不涉及配置管理
- [x] 是否支持主流 Linux 发行版 - **是**，增强跨平台兼容性（Windows/Linux/macOS）
- [x] 网络操作是否有超时重试机制 - **N/A**，不涉及网络操作

### IV. 测试优先（强制性）
- [x] 是否先编写测试用例 - **是**，Phase 1 后编写测试，验证文本指示符渲染
- [x] 测试是否覆盖关键路径 - **是**，覆盖所有 logger 方法和 menu 组件
- [x] 是否包含集成测试 - **是**，测试不同终端环境下的输出
- [x] 安全功能测试优先级是否最高 - **N/A**，无新增安全功能

### V. 文档完整
- [x] 是否更新 README - **是**，将更新终端兼容性说明
- [x] 脚本是否有清晰注释 - **是**，保持现有注释标准
- [x] 配置文件是否有参数说明 - **N/A**，不涉及配置文件
- [x] 中英文文档是否同步 - **是**，保持中文文档为主

**违规说明**（如有）：
| 违规项 | 必要性说明 | 被拒绝的简化方案及原因 |
|--------|-----------|---------------------|
| 无 | N/A | N/A |

## Project Structure

### Documentation (this feature)

```text
specs/003-cli-ui-optimization/
├── spec.md              # 功能规格说明 (已完成)
├── plan.md              # 本文件 (实施计划)
├── research.md          # Phase 0 输出 (研究文档)
├── data-model.md        # Phase 1 输出 (数据模型)
├── quickstart.md        # Phase 1 输出 (快速开始)
├── contracts/           # Phase 1 输出 (API 契约)
└── checklists/          # 质量检查清单
    └── requirements.md  # 规格说明质量检查 (已完成)
```

### Source Code (repository root)

```text
src/
├── cli.ts                    # CLI 入口点 [MODIFY] - 移除 emoji
├── commands/
│   ├── interactive.ts        # 交互式菜单 [MODIFY] - 替换菜单 emoji
│   ├── service.ts            # 服务管理命令 [MODIFY] - 替换状态 emoji
│   ├── user.ts               # 用户管理命令 [MODIFY] - 替换状态 emoji
│   ├── config.ts             # 配置管理命令 [MODIFY] - 替换状态 emoji
│   └── logs.ts               # 日志查看命令 [MODIFY] - 替换日志级别 emoji
├── utils/
│   ├── logger.ts             # 日志工具 [MAJOR REFACTOR] - 核心重构目标
│   ├── terminal.ts           # [NEW] 终端能力检测工具
│   └── icons.ts              # [NEW] 图标/指示符映射
├── constants/
│   └── ui-symbols.ts         # [NEW] UI 符号常量定义
└── types/
    └── terminal.ts           # [NEW] 终端相关类型定义

tests/
├── unit/
│   ├── logger.test.ts        # [NEW] logger 单元测试
│   ├── terminal.test.ts      # [NEW] terminal 工具测试
│   └── icons.test.ts         # [NEW] icons 映射测试
└── integration/
    └── ui-compatibility.test.ts  # [NEW] UI 兼容性集成测试
```

**Structure Decision**: 采用单项目结构（Single Project），因为这是一个 CLI 工具，所有代码位于 `src/` 目录下。主要修改集中在 UI 层（logger, interactive），新增终端能力检测和图标映射模块。测试采用 Vitest 框架，分为单元测试和集成测试。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项。本功能完全符合项目宪章的所有核心原则。
