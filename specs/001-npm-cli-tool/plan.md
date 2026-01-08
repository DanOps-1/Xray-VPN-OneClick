# Implementation Plan: Xray 服务管理 CLI 工具

**Branch**: `001-npm-cli-tool` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-npm-cli-tool/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

将现有的 Xray 服务管理 Bash 脚本改造为可通过 npm 全局安装的交互式命令行工具。用户执行 `npm install -g xray-manager` 后，可通过 `xray-manager` 或 `xm` 命令启动交互式菜单，完成服务管理（启动/停止/重启）、用户管理（添加/删除/查看）、配置管理（备份/恢复/修改）和日志查看等操作。

**核心技术方向**：
- Node.js CLI 应用，使用 TypeScript 开发确保类型安全
- 交互式菜单系统（inquirer 或类似库）
- 通过 child_process 调用 systemctl 管理 systemd 服务
- 采用优雅关闭策略处理服务重启（10秒超时）
- 敏感信息脱敏显示（前4后4）+ 剪贴板复制功能
- 中英文双语支持（i18n）
- TDD 开发流程：测试优先，红-绿-重构

## Technical Context

**Language/Version**: Node.js 18.0.0+, TypeScript 5.0.0+
**Primary Dependencies**:
  - **CLI Framework**: @inquirer/prompts (交互菜单), Commander.js (参数解析)
  - **Terminal UI**: Chalk 4.x (样式), Ora (加载动画), Clipboardy (剪贴板)
  - **Process Management**: child_process.spawn() (systemctl 调用)
  - **Testing**: Vitest (10-20x faster than Jest), c8 (V8 native coverage)

**Storage**:
  - Configuration: JSON files (`/usr/local/etc/xray/config.json`)
  - Backups: `/var/backups/xray/` (timestamped JSON files)
  - Logs: systemd journal (accessed via `journalctl`)

**Testing**:
  - Framework: Vitest with c8 coverage
  - Coverage Targets: 80% lines, 80% functions, 75% branches
  - Strategy: TDD (Red-Green-Refactor-Commit)
  - Test Layers: Unit tests + Integration tests + E2E tests

**Target Platform**:
  - Linux with systemd: Debian 10+, Ubuntu 20.04+, CentOS 8+, Kali Linux
  - Requires: systemd, Node.js 18+, sudo/root privileges (for service operations)

**Project Type**: Single project (CLI application)

**Performance Goals**:
  - Menu startup: < 500ms (SC-003)
  - Menu navigation: < 100ms delay (SC-002)
  - Key response: < 50ms (SC-002)
  - Service restart downtime: < 10s (FR-016, graceful shutdown)

**Constraints**:
  - Must run on systemd-based Linux distributions only
  - Requires root privileges for service/config operations
  - Graceful shutdown timeout: 10 seconds (FR-016)
  - Terminal: Must support ANSI escape sequences (colors, cursor control)

**Scale/Scope**:
  - Target users: ~1000 installations (small to medium deployments)
  - Concurrent operations: Single-user CLI (no concurrency required)
  - Configuration complexity: ~5-20 users per server typical
  - Codebase size: Estimated ~3000-5000 LOC (TypeScript)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

根据 `.specify/memory/constitution.md` 检查以下核心原则：

### I. 安全第一
- [x] 密钥/UUID 是否自动生成（禁止硬编码） - ✅ 使用 `crypto.randomUUID()` 生成 UUID
- [x] 敏感信息是否正确处理（不记录到日志） - ✅ 敏感信息脱敏显示（前4后4）+ 剪贴板复制
- [x] 配置文件权限是否正确（600） - ✅ ConfigManager 写入时设置 `mode: 0o600`
- [x] 用户输入是否经过验证和清理 - ✅ 完整的验证器模块（邮箱、UUID、端口、域名、服务名）

### II. 简洁易用
- [x] 默认配置是否满足大多数用户需求 - ✅ 所有参数都有合理默认值
- [x] 是否实现一键部署 - ✅ `npm install -g xray-manager` 后直接运行 `xm`
- [x] 错误提示是否清晰（中英文双语） - ✅ 所有错误包含中英文提示和建议解决方案
- [x] 是否避免不必要的复杂度 - ✅ 交互式菜单最多 3 层深度，常用操作 < 5 次按键

### III. 可靠稳定
- [x] 是否包含错误检测和友好提示 - ✅ SystemdError 类提供详细错误和建议
- [x] 是否支持配置备份和恢复 - ✅ ConfigManager 自动备份 + 一键恢复
- [x] 是否支持主流 Linux 发行版 - ✅ Debian 10+, Ubuntu 20.04+, CentOS 8+, Kali
- [x] 网络操作是否有超时重试机制 - ✅ 所有 systemctl 操作都有超时配置

### IV. 测试优先（强制性）
- [x] 是否先编写测试用例 - ✅ TDD 流程：Red-Green-Refactor-Commit (RGRC)
- [x] 测试是否覆盖关键路径 - ✅ 覆盖率目标：80% lines, 80% functions, 75% branches
- [x] 是否包含集成测试 - ✅ 单元 + 集成 + E2E 三层测试
- [x] 安全功能测试优先级是否最高 - ✅ 脱敏显示、输入验证、权限检查优先测试

### V. 文档完整
- [x] 是否更新 README - ⚠️ 待实施阶段更新（已规划）
- [x] 脚本是否有清晰注释 - ✅ TypeScript 类型系统 + JSDoc 注释
- [x] 配置文件是否有参数说明 - ✅ data-model.md 完整定义所有字段
- [x] 中英文文档是否同步 - ✅ 所有文档支持中英文

**违规说明**（如有）：
| 违规项 | 必要性说明 | 被拒绝的简化方案及原因 |
|--------|-----------|---------------------|
| - | - | - |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
