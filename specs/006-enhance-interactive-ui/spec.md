# Feature Specification: Enhance Interactive UI

**Feature Branch**: `006-enhance-interactive-ui`
**Created**: 2026-01-09
**Status**: Draft
**Input**: User description: "当前项目的ts交互界面太简陋，交互体验太差，请优化"

## Clarifications

### Session 2026-01-09

- Q: Dashboard 数据更新频率？ → A: 静态快照（仅在菜单重绘或操作完成后刷新）。
- Q: Dashboard 在菜单中的位置布局？ → A: 固定顶部展示（Persistent Header），在主菜单选项上方常驻显示。
- Q: 界面渲染策略？ → A: 全屏重绘（Clear & Redraw），每次显示菜单前清理终端屏幕以保持界面整洁。
- Q: 面包圈（Breadcrumb）导航形式？ → A: 顶部状态栏展示（如 Home > User Management），紧跟在 Dashboard 之后。
- Q: 用户列表数据量过大处理？ → A: 摘要模式（Summary Row），仅显示前 N 个用户并附带 "还有 N 个..." 的统计行。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comprehensive Dashboard (Priority: P1)

Users are greeted with a rich "Dashboard" view upon entering the interactive mode, providing an immediate overview of system health, service status, and key metrics without needing to navigate submenus.

**Why this priority**: Addresses the "too simple" complaint directly by transforming the entry point from a list of text to a professional status monitor. This provides immediate value and a "premium" feel.

**Independent Test**: Launch the interactive CLI. Verify that the initial screen displays a formatted dashboard containing Service Status, System Resources (basic), and User Count in a structured layout (e.g., boxes/panels) rather than just a text line.

**Acceptance Scenarios**:

1. **Given** the user launches the interactive tool, **When** the main screen loads, **Then** they see a "Dashboard" section at the top displaying Xray service status (Active/Inactive), Uptime, and Version.
2. **Given** the dashboard is displayed, **When** the system is running, **Then** basic resource usage (e.g., Memory usage of the process or system) is visible.
3. **Given** the user has configured users, **When** viewing the dashboard, **Then** the total count of active users is displayed prominently.

---

### User Story 2 - Rich User Management Table (Priority: P1)

Users can view and manage users through a structured table interface that displays key user details (Username, UUID prefix, Traffic/Status) in aligned columns, rather than a simple vertical list.

**Why this priority**: User management is a core function. A table view significantly improves readability and comparison of users, addressing the "poor experience" in data density and presentation.

**Independent Test**: Navigate to "User Management" -> "List Users". Verify output is formatted as a table with headers (Name, UUID, Status) and aligned columns, utilizing the full terminal width available (respecting 005 layout rules).

**Acceptance Scenarios**:

1. **Given** multiple users exist, **When** selecting "List Users", **Then** the output is rendered as a table with columns for Username, Port/Protocol (if applicable), and Status.
2. **Given** the table is displayed, **When** the terminal is wide, **Then** additional columns (e.g., Comments/Notes) are shown.
3. **Given** the table is displayed, **When** the terminal is narrow, **Then** critical columns (Username, UUID) are prioritized, and the table adapts to fit.

---

### User Story 3 - Visual Polish & Navigation (Priority: P2)

Users experience a cohesive UI with consistent visual framing (borders/boxes), clear navigation breadcrumbs, and reduced visual noise (flickering).

**Why this priority**: Enhances the "feel" of the application, making it seem more robust and polished.

**Independent Test**: Navigate through 3 levels of menus. Verify that a "Breadcrumb" or "Current Path" indicator (e.g., `Home > User Management > Add User`) is always visible, and section headers use consistent styling (e.g., bold/underlined or boxed).

**Acceptance Scenarios**:

1. **Given** the user is in a submenu, **When** they look at the header, **Then** they see a clear indication of their current location in the menu hierarchy.
2. **Given** the user completes an action, **When** the success message appears, **Then** it is visually distinct (e.g., inside a success box or with a specific icon) and clearly separates itself from the menu options.

---

### Edge Cases

- **Small Terminals**: Dashboard must collapse gracefully if height < 20 lines (hide resource usage, keep service status).
- **No Unicode**: Fallback to ASCII box drawing characters if Unicode is not supported (aligned with 003).
- **Data Load**: If user list is huge (>10 users in summary view), the table MUST show the top 10 users followed by a summary row indicating the total remaining count (e.g., "+ 45 more users") to prevent excessive vertical growth.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Dashboard" panel persistently at the top of the main menu, showing Service Status (Systemd), Uptime, and User Count. The data MUST be a static snapshot refreshed only upon entering the menu or after an action completes.
- **FR-002**: System MUST render user lists using a column-aligned table format with headers and adaptive column widths.
- **FR-003**: System MUST implement a "Breadcrumb" navigation bar displayed as a dedicated line at the top of the interface (directly below the Dashboard) to indicate the current menu path.
- **FR-004**: System MUST use box-drawing characters (Unicode with ASCII fallback) to frame distinct UI sections (Dashboard, Menu, Output).
- **FR-005**: System MUST provide a "System Info" section in the dashboard showing basic OS info (OS type, Release) to help with debugging context.
- **FR-006**: System MUST clear the terminal screen before rendering the dashboard and main menu to provide a clean "app-like" feel. Command output and logs MAY be displayed in a transient manner, but returning to the menu MUST trigger a full screen redraw.

### Key Entities

- **DashboardWidget**: Component responsible for rendering status blocks (Service, System, Users).
- **TableRenderer**: Component responsible for rendering data lists into formatted tables with adaptive column widths.
- **NavigationState**: entity tracking the current menu path (stack) for breadcrumb rendering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify the Xray service status (Active/Inactive) within 1 second of launching the tool (Dashboard visibility).
- **SC-002**: User list table renders correctly aligned columns on 80-column, 100-column, and 120-column terminals.
- **SC-003**: Navigation depth is always visible; users never lose track of which submenu they are in.
- **SC-004**: "Simple" text-only headers are replaced with styled headers (boxes/borders) in 100% of interactive screens.

## Assumptions

- **AS-001**: `cli-table3` or similar library is available or can be added/used (it is already in `package.json`).
- **AS-002**: System resource usage (CPU/RAM) might be retrieved via standard Node.js `os` module; if realtime stats are too heavy, static OS info is sufficient.
- **AS-003**: The "Interactive" mode is the primary focus; CLI arguments/flags mode is unaffected.