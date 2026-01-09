# Research & Design Decisions: Enhance Interactive UI

**Feature**: Enhance Interactive UI
**Date**: 2026-01-09

## 1. Dashboard Update Strategy

- **Decision**: Static Snapshot (Refreshed on Action/Redraw)
- **Rationale**:
  - **Simplicity & Stability**: Avoids the complexity of handling background event loops and potential race conditions with user input in a standard Node.js CLI environment.
  - **Compatibility**: Ensures consistent behavior across various terminal emulators without relying on advanced cursor manipulation or "alternate screen" modes that might be flaky on some systems.
  - **Sufficiency**: For a management tool, users typically need status *at the moment of decision*, not a realtime monitor (like `top`). Refreshing after an action (e.g., starting a service) provides the necessary feedback loop.
- **Alternatives Considered**:
  - *Live Auto-Refresh*: Rejected due to high implementation complexity and risk of interfering with user input in a standard CLI input flow.
  - *Manual Refresh Only*: Rejected as too passive; users expect to see the result of their actions immediately.

## 2. Dashboard Layout

- **Decision**: Persistent Header
- **Rationale**:
  - **Visibility**: Critical status information (Service Status, User Count) remains visible while the user navigates menus, providing constant context.
  - **Professionalism**: Mimics standard TUI (Text User Interface) application layouts, enhancing the perceived quality of the tool.
  - **Space Efficiency**: By dedicating the top few lines to status, the rest of the screen is free for menu options or data tables.
- **Alternatives Considered**:
  - *Separate Dashboard View*: Rejected as it buries high-value information behind a menu click.
  - *Landing Page Only*: Rejected because the context is lost once the user navigates to a submenu.

## 3. Screen Rendering Strategy

- **Decision**: Full Screen Redraw (Clear & Redraw)
- **Rationale**:
  - **Cleanliness**: Prevents the "scrollback clutter" typical of simpler CLIs, where every menu repaint appends to the history.
  - **Focus**: Keeps the user's attention on the current state of the application.
  - **Consistency**: Ensures the layout calculations (centering, borders) are always based on a clean canvas.
- **Alternatives Considered**:
  - *Append Only*: Rejected as it creates a messy history and makes it hard to see the current state after multiple interactions.

## 4. Navigation Aid

- **Decision**: Top Bar Breadcrumb (e.g., `Home > User Management > Add`)
- **Rationale**:
  - **Orientation**: Users instantly know their location in the menu hierarchy, reducing cognitive load.
  - **Standard Pattern**: Aligns with common UI/UX patterns in both web and desktop applications.
- **Alternatives Considered**:
  - *Prompt Prefix*: Rejected as it clutters the input line and can be missed.

## 5. Large List Handling

- **Decision**: Summary Row (Top N + "X more")
- **Rationale**:
  - **Performance**: Rendering hundreds of rows can be slow and flood the terminal buffer.
  - **Usability**: Users typically look for specific users or recent ones; a full dump is rarely the primary need in an interactive menu (better served by a specific `list-all` command or search).
  - **Layout Integrity**: Prevents the table from overwhelming the persistent dashboard and menu options.
- **Alternatives Considered**:
  - *Full Pagination*: Rejected for the main interactive view to keep the implementation lightweight; could be added later if "manage specific user" flows require browsing.
