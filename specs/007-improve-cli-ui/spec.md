# Feature Specification: Improve CLI UI Aesthetics

**Feature Branch**: `007-improve-cli-ui`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "交互界面还是不美观。请参考opencode或者gemini-cli的交互界面"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Refined Dashboard Aesthetics (Priority: P1)

Users see a cleaner, more modern dashboard that uses subtle colors and refined spacing, inspired by modern CLI tools like OpenCode. The "heavy" borders should be replaced or refined to look less like a legacy DOS application and more like a modern terminal tool.

**Why this priority**: The user explicitly mentioned the interface is "not beautiful enough" despite previous functional improvements. Visual polish is the primary goal.

**Independent Test**: Launch the CLI. Verify the dashboard looks "lighter" - perhaps using rounded corners (if supported/simulated), different border styles, or better internal padding.

**Acceptance Scenarios**:

1. **Given** the dashboard renders, **When** displayed on a modern terminal, **Then** it uses a border style that is distinct from the previous "double/heavy" style (e.g., single line, rounded if available, or just cleaner separation).
2. **Given** status indicators, **When** showing "Active", **Then** use a more subtle or modern indicator (e.g., a colored dot or refined text badge) rather than just colored text.

---

### User Story 2 - Minimalist Navigation Bar (Priority: P2)

The navigation/breadcrumb bar is simplified to reduce visual noise. Instead of full-width separators lines which can look cluttered, use cleaner spacing or subtle background colors (if viable) or just minimal text hierarchy.

**Why this priority**: The current "full width line" separator might be contributing to the "ugly" feel.

**Independent Test**: Navigate to a submenu. Verify the breadcrumb is clear but doesn't dominate the screen with heavy horizontal lines.

**Acceptance Scenarios**:

1. **Given** the user navigates to "User Management", **When** the header renders, **Then** the breadcrumb `Home > User Management` is displayed cleanly without heavy full-width divider lines above and below it.

---

### User Story 3 - Consistent Color Palette (Priority: P3)

The application uses a cohesive color theme that avoids "rainbow" effects. Colors are used semantically and sparingly.

**Why this priority**: Overuse of standard primary colors (Red/Green/Blue/Cyan/Magenta all at once) can look amateurish.

**Independent Test**: View the main menu. Verify that colors are used primarily for status (Green/Red) and highlights/selection, while static labels use neutral tones (Gray/White).

**Acceptance Scenarios**:

1. **Given** the main menu options, **When** displayed, **Then** icons might be colored but text labels should largely be neutral or consistent, rather than every option having a different strong color.

---

### Edge Cases

- **No Color Support**: Ensure the "cleaner" look still has enough contrast on monochrome terminals.
- **Legacy Terminals**: "Rounded" corners or special characters must fallback gracefully to standard ASCII or simple Unicode lines.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST update the `DashboardWidget` to use a "modern" border style (e.g., `cli-table3`'s single line or custom characters).
- **FR-002**: System MUST remove the full-width horizontal separators surrounding the Breadcrumb bar in `ScreenManager`, replacing them with padding or a single subtle separator if needed.
- **FR-003**: System MUST update the color scheme in `getMainMenuOptions` to reduce color variety. Use a primary accent color (e.g., Blue or Cyan) for interactive elements and neutral colors for labels.
- **FR-004**: System MUST refine the spacing in the Dashboard to ensure content isn't cramped against the borders.

### Key Entities *(include if feature involves data)*

- **ThemeConfig**: (Implicit) A conceptual set of constants for Colors and Border styles to ensure consistency.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The dashboard renders using a different, lighter border style than the previous iteration.
- **SC-002**: The main menu uses max 3 distinct colors for static text (e.g., White, Gray, Accent), excluding status indicators.
- **SC-003**: Breadcrumb navigation no longer uses `─`.repeat(width) separator lines.

## Assumptions

- **AS-001**: `cli-table3` supports customization of border characters sufficient to achieve the desired look.
- **AS-002**: "Modern" is interpreted as "Minimalist, flat, better whitespace, restricted color palette".

## Out of Scope

- **OOS-001**: Complete rewrite of the rendering engine (e.g., moving to React Ink or Blessed). We are refining the existing `console.log` + `inquirer` approach.