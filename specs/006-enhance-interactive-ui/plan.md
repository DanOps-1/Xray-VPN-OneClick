# Implementation Plan - Enhance Interactive UI

## Technical Context

**Feature**: `006-enhance-interactive-ui`

**Goal**: Transform the current text-based CLI into a polished, app-like interactive experience with a persistent dashboard, structured tables, and clear navigation.

**Current State**:
- Simple text menus using `@inquirer/prompts`.
- Basic `console.log` output for status and lists.
- `cli-table3` is used but simple list rendering exists.
- Terminal capabilities detection is present (`src/utils/terminal.ts`).
- Layout manager exists but focuses on simple sizing (`src/services/layout-manager.ts`).

**Constraints**:
- Must work on standard terminals (80x24 minimum).
- Must gracefully handle non-Unicode environments (Windows CMD).
- No new heavy dependencies (stick to `cli-table3`, `chalk`, `inquirer`).
- Must adhere to project Constitution (Simplicity, Reliability).

**Dependencies**:
- `cli-table3`: For rendering the user list and dashboard layout.
- `chalk`: For styling and coloring.
- `@inquirer/prompts`: For the interactive menu selection.
- `src/utils/terminal.ts`: For detecting width/height/unicode.

## Constitution Check

| Principle | Compliance Check |
|-----------|------------------|
| **I. Library-First** | N/A (UI Enhancement) |
| **II. CLI Interface** | **Compliant**: Enhances the interactive CLI mode without breaking non-interactive flags. |
| **III. Test-First** | **Compliant**: Plan includes updating/adding tests for the new UI components (TableRenderer, DashboardWidget). |
| **IV. Integration Testing** | **Compliant**: Manual verification scenarios defined in spec; Unit tests for renderers. |
| **V. Simplicity** | **Compliant**: Using "Static Snapshot" and standard libraries avoids complex event loops. |

## Gates

- [x] **Spec Validation**: Feature spec is detailed and clarified.
- [x] **Constitution Alignment**: Proposed changes respect the core principles.
- [x] **Feasibility**: Tech stack (`cli-table3`, `inquirer`) is already in place and sufficient.

## Phase 1: Design & Contracts

### 1. Data Model (`data-model.md`)
Define the structures for the Dashboard state and Navigation state.

### 2. Component Design (`contracts/`)
- `DashboardWidget`: Interface for rendering the top status bar.
- `TableRenderer`: Interface/Class for rendering the user table.
- `NavigationManager`: Class for managing the breadcrumb stack.
- `ScreenManager`: Class for handling clear/redraw logic.

### 3. Quickstart (`quickstart.md`)
Update documentation to reflect the new UI experience.

## Phase 2: Implementation Breakdown

### 1. Foundation
- Implement `ScreenManager` to handle `console.clear()` and standard header rendering.
- Update `LayoutManager` to support "reserved" top space (for Dashboard).

### 2. Components
- Implement `DashboardWidget` using `cli-table3` (borderless or styled) to show Service Status, System Info, and User Count.
- Implement `NavigationManager` to track menu depth and render the Breadcrumb line.
- Refactor `TableRenderer` (or enhance existing `listUsers`) to support "Summary Row" logic.

### 3. Integration
- Modify `src/commands/interactive.ts` to use `ScreenManager` and `DashboardWidget`.
- Wrap the main menu loop to trigger a full redraw on every iteration.
- Integrate `NavigationManager` into the menu flow (push/pop context).

### 4. Polish
- Apply box-drawing characters (with ASCII fallback) to all new components.
- Ensure colors are consistent and meaningful (Green=Active, Red=Inactive).

## Phase 3: Verification

- **Unit Tests**: Test `DashboardWidget` rendering strings, `NavigationManager` stack logic.
- **Manual Test**: Run through the User Scenarios defined in `spec.md` on Linux and Windows (if possible, or simulate).