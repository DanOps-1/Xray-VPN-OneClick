# Feature Specification: NPM Post-Install Auto-Setup

**Feature Branch**: `002-npm-auto-install`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "目前是否还需要用一键安装的方式来下载？能不能改成用npm install后直接可以自动下载并提供服务？"

## Clarifications

### Session 2026-01-08

- Q: 当系统已存在较旧的 Xray-core 版本时，安装程序应该如何处理？ → A: 检测版本号，如果现有版本低于最新版则自动升级
- Q: 当 Xray-core 下载过程中网络缓慢或中断时，应该采用什么重试策略？ → A: 自动重试 3 次，每次间隔递增（5s、10s、20s），失败后提示镜像源或手动下载

## User Scenarios & Testing *(mandatory)*

### User Story 1 - NPM Auto-Install Xray Core (Priority: P1)

作为系统管理员，当我通过 `npm install -g xray-manager` 安装 CLI 工具时，系统应该自动检测并下载 Xray-core 可执行文件，无需单独运行安装脚本，这样我可以立即使用该工具进行服务管理。

**Why this priority**: 这是最核心的价值主张 - 简化安装流程。当前用户需要先运行 Bash 安装脚本，再安装 npm CLI 工具，两步操作容易混淆。自动化这一过程将显著提升用户体验，是 MVP 的关键功能。

**Independent Test**: 可以通过以下步骤独立测试：
1. 在干净的 Linux 系统上执行 `npm install -g xray-manager`
2. 执行 `xray-manager --version` 应该显示工具版本
3. 检查 Xray-core 是否已下载到预期位置
4. 验证可以直接使用 CLI 工具的所有功能（查看状态、管理用户等）

**Acceptance Scenarios**:

1. **Given** 用户在全新的 Ubuntu 22.04 系统上，**When** 执行 `npm install -g xray-manager`，**Then** 安装过程自动下载最新版 Xray-core 并放置到标准路径（如 `/usr/local/bin/xray`）
2. **Given** 用户在已有 Xray-core 的系统上，**When** 执行 `npm install -g xray-manager`，**Then** 检测到现有安装并跳过下载，提示用户已有版本
3. **Given** 用户在网络受限环境，**When** npm 安装过程中 Xray-core 下载失败，**Then** 显示清晰的错误信息，说明如何手动下载或使用镜像源
4. **Given** 安装完成后，**When** 用户执行 `xray-manager` 命令，**Then** 直接进入交互式菜单，无需额外配置

---

### User Story 2 - Auto-Generate Default Config (Priority: P2)

作为系统管理员，当 npm 安装完成后首次运行 `xray-manager` 时，如果系统未找到有效配置文件，工具应该自动生成一个包含默认设置的配置模板（UUID、密钥、端口等），让我可以快速启动服务进行测试。

**Why this priority**: 这是第二优先级，因为它补充了 P1 的自动化体验。虽然用户仍需手动编辑某些配置（如目标域名），但自动生成模板减少了手动创建 JSON 配置的复杂性，特别适合快速测试场景。

**Independent Test**: 可以通过以下步骤独立测试：
1. 在已安装 `xray-manager` 但无配置的系统上运行 `xray-manager`
2. 工具应提示"未找到配置，是否生成默认配置？"
3. 确认后，应生成 `/etc/xray/config.json` 并包含随机生成的 UUID、密钥等
4. 用户可以立即查看配置并根据需要修改

**Acceptance Scenarios**:

1. **Given** 系统无 `/etc/xray/config.json`，**When** 用户首次运行 `xray-manager`，**Then** 提示用户生成默认配置或退出
2. **Given** 用户选择生成配置，**When** 系统执行生成操作，**Then** 创建配置文件并自动生成 UUID v4、Reality 密钥对、Short ID 等安全参数
3. **Given** 配置生成成功，**When** 用户查看配置，**Then** 看到清晰的注释说明哪些字段需要手动修改（如 dest 目标域名）
4. **Given** 默认配置已生成，**When** 用户启动服务，**Then** 服务能够正常运行（假设网络环境允许）

---

### User Story 3 - Post-Install Service Setup (Priority: P3)

作为系统管理员，在 npm 安装完成后，我希望工具能提供可选的 systemd 服务自动配置，这样我可以选择是否将 Xray 配置为开机自启动，而不是强制执行。

**Why this priority**: 这是最低优先级，因为不是所有用户都需要 systemd 集成（如容器化部署、测试环境）。提供可选的自动化配置可以满足需要永久部署的用户，但不应是 MVP 的阻塞功能。

**Independent Test**: 可以通过以下步骤独立测试：
1. 完成 npm 安装后，运行 `xray-manager setup-service`
2. 工具应询问是否创建 systemd 服务单元
3. 确认后，应生成 `/etc/systemd/system/xray.service` 并启用服务
4. 执行 `sudo systemctl status xray` 验证服务已注册

**Acceptance Scenarios**:

1. **Given** 用户已完成 npm 安装，**When** 执行 `xray-manager setup-service`，**Then** 提示用户是否创建 systemd 服务（需要 root 权限）
2. **Given** 用户确认创建服务，**When** 工具生成 service 文件，**Then** 文件包含正确的 ExecStart 路径和安全设置（如 DynamicUser）
3. **Given** systemd 服务已创建，**When** 用户执行 `sudo systemctl enable xray`，**Then** 服务配置为开机自启动
4. **Given** 用户选择跳过 systemd 配置，**When** 工具退出，**Then** 不影响用户手动启动 `xray` 进程

---

### Edge Cases

- **权限不足**：普通用户安装 npm 包时无 root 权限写入 `/usr/local/bin`，如何处理？是否提供用户级安装路径（如 `~/.local/bin`）？
- **平台兼容性**：不同 CPU 架构（x64、ARM、ARM64）和操作系统（Ubuntu、Debian、CentOS、Alpine）如何自动选择正确的 Xray-core 二进制文件？
- **离线安装**：完全离线环境下，用户如何手动提供 Xray-core 文件并跳过自动下载？
- **配置迁移**：从旧的 Bash 安装脚本迁移到 npm 安装方式时，如何保留现有配置和用户数据？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: npm 包的 `postinstall` 脚本 MUST 自动检测系统架构（x64/ARM/ARM64）和操作系统类型
- **FR-002**: 系统 MUST 从 GitHub Releases 下载与当前平台匹配的最新 Xray-core 二进制文件
- **FR-003**: 下载的 Xray-core 可执行文件 MUST 放置到标准路径（优先 `/usr/local/bin/xray`，若无权限则降级到 `~/.local/bin/xray`）
- **FR-004**: 系统 MUST 在下载前检测是否已存在 Xray-core，若存在则比较版本号，当现有版本低于最新版时自动升级，当版本相同或更新时跳过下载并提示用户
- **FR-005**: 下载失败时 MUST 显示详细错误信息，包括失败原因和建议的解决方案（如使用镜像源、手动下载）
- **FR-006**: 首次运行 `xray-manager` 时，若未找到配置文件，MUST 提示用户是否自动生成默认配置
- **FR-007**: 自动生成的配置 MUST 包含随机生成的 UUID v4、Reality 公私钥对、Short ID 和默认端口（443）
- **FR-008**: 生成的配置文件 MUST 包含清晰的中英文注释，标明哪些字段需要用户手动修改
- **FR-009**: 系统 MUST 提供 `xray-manager setup-service` 命令用于可选的 systemd 服务配置
- **FR-010**: systemd 服务配置 MUST 包含安全最佳实践（如 `DynamicUser=yes`、限制文件访问等）
- **FR-011**: 安装脚本 MUST 设置正确的文件权限（Xray-core 可执行权限 755，配置文件权限 600）
- **FR-012**: 系统 MUST 支持通过环境变量 `XRAY_CORE_PATH` 指定自定义 Xray-core 路径以支持离线安装
- **FR-013**: 下载过程 MUST 显示进度信息（文件大小、下载速度、剩余时间）
- **FR-014**: 下载失败时 MUST 自动重试最多 3 次，重试间隔分别为 5 秒、10 秒、20 秒（递增退避策略）
- **FR-015**: 所有重试失败后 MUST 显示备用下载方案（镜像源列表、手动下载链接）

### Constitution Compliance Requirements

根据项目宪章 (`.specify/memory/constitution.md`)，以下要求是强制性的：

- **CR-001**: 安全性 - 生成的 UUID、密钥必须使用加密安全的随机数生成器（如 `crypto.randomUUID()`、`openssl genrsa`）
- **CR-002**: 简洁性 - npm 安装必须一行命令完成（`npm install -g xray-manager`），无需额外步骤
- **CR-003**: 可靠性 - 必须支持多种下载源（GitHub、镜像源、自定义 URL），确保跨网络环境可用
- **CR-004**: 测试 - 核心安装逻辑必须包含单元测试（模拟下载、权限检测）和集成测试（不同平台的端到端测试）
- **CR-005**: 文档 - 必须更新 README 安装章节，明确说明新的 npm 安装方式，并保留旧的 Bash 脚本方式作为备选

### Key Entities

- **Installation Metadata**: 记录安装信息（Xray-core 版本、安装路径、安装时间），用于后续更新检测
- **Platform Profile**: 系统平台信息（OS、架构、包管理器类型），用于选择正确的二进制文件
- **Config Template**: 默认配置模板，包含必需字段和可选字段的结构定义

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以在 2 分钟内完成从零到运行 Xray 服务的整个流程（包括 npm 安装和首次配置）
- **SC-002**: npm 安装成功率达到 95% 以上（在主流 Linux 发行版：Ubuntu 20.04+、Debian 11+、CentOS 8+）
- **SC-003**: 80% 的用户无需查阅文档即可完成安装和基本配置（通过清晰的提示信息和默认配置）
- **SC-004**: 支持离线安装场景，用户可以通过环境变量跳过自动下载并使用本地 Xray-core 文件
- **SC-005**: 减少安装相关的 GitHub Issues 数量 50% 以上（相比当前的 Bash 脚本安装方式）

## Assumptions

- **A-001**: 假设用户系统已安装 Node.js 18+ 和 npm（作为 npm 包的前置条件）
- **A-002**: 假设目标用户主要使用 systemd 的 Linux 发行版（非 systemd 用户可手动管理进程）
- **A-003**: 假设用户具备基本的 Linux 命令行操作能力和 sudo 权限（用于系统级安装）
- **A-004**: 假设 Xray-core 官方持续提供 GitHub Releases 且 API 格式保持稳定
- **A-005**: 假设默认配置适用于 80% 的基本使用场景（Reality 协议 + 标准端口 443）

## Out of Scope

以下内容不在本功能范围内：

- **自动配置防火墙规则**：用户需手动配置 iptables 或 ufw 开放端口
- **自动域名解析设置**：用户需手动配置 DNS 记录指向服务器 IP
- **图形化配置界面**：仍使用 CLI 交互式菜单，不提供 Web UI
- **自动化证书申请**：Reality 协议不需要真实证书，故不集成 Let's Encrypt
- **Docker 镜像自动化**：本功能仅针对原生 npm 安装，不涉及容器化部署
- **Windows/macOS 支持**：本功能仅支持 Linux 服务器环境（Xray 服务端运行环境）

## Dependencies

- **External**: GitHub API (https://api.github.com/repos/XTLS/Xray-core/releases/latest) 用于获取最新版本信息
- **External**: Xray-core 官方二进制文件下载（需网络连接，除非使用离线安装）
- **Internal**: 现有的 ConfigManager、SystemdManager 服务需适配新的安装路径逻辑
- **Internal**: CLI 工具的 preflight 检查模块需更新，检测 Xray-core 是否可用

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| GitHub API 限流导致下载失败 | High | 提供备用镜像源（jsDelivr、ghproxy）；支持手动下载 |
| 权限问题导致文件写入失败 | Medium | 降级到用户目录安装；提供清晰的权限错误提示 |
| 平台检测错误导致下载错误版本 | High | 增加平台检测测试覆盖；允许用户手动指定架构 |
| 自动生成的配置不适用于特定场景 | Low | 提供配置模板多样性（基础版、高级版）；保留手动编辑选项 |
| 旧版本 Xray-core 与新配置格式不兼容 | Medium | 在下载前检查版本兼容性；提供版本降级选项 |
