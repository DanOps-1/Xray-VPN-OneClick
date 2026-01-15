# Feature Specification: 自动启用 Xray Stats API

**Feature Branch**: `011-auto-stats-api`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "希望自动为 Xray 配置启用 Stats API"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 自动检测并启用 Stats API (Priority: P1)

管理员在使用流量配额管理功能时，系统自动检测 Xray 配置中是否已启用 Stats API。如果未启用，系统提示用户是否自动配置，用户确认后系统自动修改配置文件并重启服务，使流量统计功能可用。

**Why this priority**: 这是核心功能，没有 Stats API 就无法获取用户流量数据，流量配额管理功能将无法正常工作。

**Independent Test**: 可以通过在未配置 Stats API 的 Xray 环境中运行流量配额查看功能来测试，验证系统能否自动完成配置。

**Acceptance Scenarios**:

1. **Given** Xray 配置中未启用 Stats API，**When** 用户查看流量配额详情，**Then** 系统提示 Stats API 未启用并询问是否自动配置
2. **Given** 用户确认自动配置，**When** 系统执行配置，**Then** 系统备份原配置、添加 Stats API 配置、重启服务，并显示成功消息
3. **Given** 自动配置完成，**When** 用户再次查看流量配额，**Then** 流量统计数据正常显示

---

### User Story 2 - 配置前备份与回滚 (Priority: P1)

系统在修改 Xray 配置前自动创建备份，如果配置修改后服务启动失败，系统自动回滚到原配置并通知用户。

**Why this priority**: 配置修改可能导致服务不可用，备份和回滚机制是保护用户系统稳定性的关键。

**Independent Test**: 可以通过模拟配置错误场景测试回滚机制是否正常工作。

**Acceptance Scenarios**:

1. **Given** 系统准备修改配置，**When** 执行修改前，**Then** 系统创建带时间戳的配置备份文件
2. **Given** 配置修改完成，**When** 服务重启失败，**Then** 系统自动恢复备份配置并重启服务
3. **Given** 回滚完成，**When** 服务恢复正常，**Then** 系统显示错误原因和回滚成功消息

---

### User Story 3 - 手动触发配置 (Priority: P2)

管理员可以通过菜单选项主动触发 Stats API 配置，而不必等到查看流量时才被提示。

**Why this priority**: 提供主动配置入口，让用户可以提前准备好环境，提升用户体验。

**Independent Test**: 可以通过菜单操作测试配置功能是否可独立触发。

**Acceptance Scenarios**:

1. **Given** 用户在流量配额管理菜单，**When** 选择"配置 Stats API"选项，**Then** 系统检测当前状态并执行配置流程
2. **Given** Stats API 已启用，**When** 用户选择配置选项，**Then** 系统提示已配置并显示当前 API 端口

---

### Edge Cases

- 配置文件不存在或无法读取时，系统应提示用户检查 Xray 安装
- 配置文件 JSON 格式错误时，系统应提示具体错误位置
- 用户没有 root 权限时，系统应提示需要管理员权限
- Xray 服务未安装时，系统应提示先安装 Xray
- 配置文件已有部分 Stats 配置但不完整时，系统应智能补全而非覆盖

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 能够检测 Xray 配置文件中是否存在 `stats` 配置块
- **FR-002**: 系统 MUST 能够检测 Xray 配置文件中是否存在 API inbound 配置
- **FR-003**: 系统 MUST 在修改配置前创建带时间戳的备份文件
- **FR-004**: 系统 MUST 能够向现有配置中添加 `stats: {}` 配置块
- **FR-005**: 系统 MUST 能够添加 API inbound 配置（默认端口 10085，仅监听 127.0.0.1）
- **FR-006**: 系统 MUST 能够添加 API 配置块，启用 StatsService
- **FR-007**: 系统 MUST 能够添加路由规则，将 API 流量导向 API handler
- **FR-008**: 系统 MUST 在配置修改后重启 Xray 服务
- **FR-009**: 系统 MUST 在服务重启失败时自动回滚配置
- **FR-010**: 系统 MUST 在流量统计不可用时提示用户并提供自动配置选项
- **FR-011**: 系统 MUST 验证配置修改后 Stats API 是否可正常连接

### Key Entities

- **Xray 配置文件**: 存储 Xray 服务配置的 JSON 文件，通常位于 `/usr/local/etc/xray/config.json`
- **Stats 配置**: 启用流量统计功能的配置块
- **API Inbound**: 用于接收 Stats API 请求的入站配置
- **配置备份**: 修改前的配置文件副本，用于回滚

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户从发现 Stats API 未启用到完成自动配置的整个流程在 30 秒内完成
- **SC-002**: 配置修改成功率达到 95% 以上（排除权限不足等外部因素）
- **SC-003**: 配置失败时 100% 能够成功回滚到原配置
- **SC-004**: 自动配置后流量统计功能立即可用，无需用户额外操作

## Assumptions

- Xray 已正确安装在系统中
- 用户以 root 权限运行管理工具
- Xray 配置文件为有效的 JSON 格式
- 系统使用 systemd 管理 Xray 服务
- API 端口 10085 未被其他服务占用
