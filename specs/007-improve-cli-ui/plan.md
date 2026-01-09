# Implementation Plan - Improve CLI UI Aesthetics

## Technical Context

**Feature**: `007-improve-cli-ui`

**Goal**: Refine the visual presentation of the CLI to be more modern, minimalist, and "OpenCode-like" by lightening borders, simplifying navigation, and unifying the color palette.

**Current State**:
- Dashboard uses default/heavy borders.
- Navigation bar is sandwiched between full-width separator lines.
- Main menu uses a variety of colors (Cyan, Green, Red, Yellow, Blue, Magenta) for different options.
- Status indicators might be coloring full text strings.

**Constraints**:
- Must rely on `cli-table3` and `chalk` (no new rendering libraries).
- Must remain compatible with standard terminals (80x24 min).
- Must adhere to previous accessibility/compatibility work (Feature 003).

**Dependencies**:
- `cli-table3`: For dashboard rendering.
- `chalk`: For coloring.
- `src/constants/ui-symbols.ts`: For shared symbols.

## Constitution Check

| Principle | Compliance Check |
|-----------|------------------|
| **I. Library-First** | N/A (UI Enhancement) |
| **II. CLI Interface** | **Compliant**: Purely visual changes to the interactive mode. |
| **III. Test-First** | **Compliant**: Plan includes updating/verifying rendering logic via tests. |
| **IV. Integration Testing** | **Compliant**: Manual visual verification is key here, but unit tests will check string output structure. |
| **V. Simplicity** | **Compliant**: Simplifies the visual design (removing lines, reducing colors). |

## Gates

- [x] **Spec Validation**: Feature spec passed.
- [x] **Constitution Alignment**: Changes are aligned with simplicity and reliability.
- [x] **Feasibility**: Visual tweaks are low-risk.

## Phase 1: Design & Contracts

### 1. Data Model (`data-model.md`)
- Define `ThemeConfig` structure (even if just constants) to centralize color choices.

### 2. Component Design (`contracts/`)
- No new interfaces needed, but existing `DashboardWidget` will be updated internally.

### 3. Quickstart (`quickstart.md`)
- Update screenshots or descriptions if they exist.

## Phase 2: Implementation Breakdown

### 1. Theme Standardization
- Define a `Theme` object in `src/constants/theme.ts` (or similar) with semantic keys: `primary`, `success`, `error`, `neutral`, `secondary`.
- Refactor `getMainMenuOptions` to use these theme colors.

### 2. Dashboard Refinement
- Update `DashboardWidget` to use a lighter border style in `cli-table3`.
- Update status display to use indicators (dots) + neutral text instead of full color.

### 3. Navigation Cleanup
- Update `ScreenManager` to remove the separator lines around the breadcrumb.
- Add padding/margin to `ScreenManager` output to let the design "breathe".

## Phase 3: Verification

- **Unit Tests**: Verify `DashboardWidget` renders with expected characters (e.g., check for `│` instead of `║` if changing border style).
- **Manual Test**: Launch CLI and visually verify the "lighter" look.