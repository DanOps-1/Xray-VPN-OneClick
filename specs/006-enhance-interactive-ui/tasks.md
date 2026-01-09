---
description: "Task list for feature 006-enhance-interactive-ui"
---

# Tasks: Enhance Interactive UI

**Input**: Design documents from `/specs/006-enhance-interactive-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are included as explicitly requested in the plan (Verification Phase).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure and dependencies (`cli-table3`, `chalk`, `@inquirer/prompts`) in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Implement `IScreenManager` interface in `src/types/ui-components.ts` (new file)
- [x] T003 Implement `ScreenManager` service in `src/services/screen-manager.ts` handling `console.clear()` and screen buffering
- [x] T004 Implement `INavigationManager` interface in `src/types/ui-components.ts` (or append to T002 file)
- [x] T005 Implement `NavigationManager` service in `src/services/navigation-manager.ts` to track menu depth
- [x] T006 Update `LayoutManager` in `src/services/layout-manager.ts` to support reserved top space for Dashboard
- [x] T007 Create unit tests for `NavigationManager` in `tests/unit/services/navigation-manager.test.ts`
- [x] T008 [P] Define `IDashboardWidget` interface in `src/types/ui-components.ts` (or append to T002 file)

**Checkpoint**: Foundation ready - Screen, Navigation, and Layout managers are in place.

---

## Phase 3: User Story 1 - Comprehensive Dashboard (Priority: P1) 🎯 MVP

**Goal**: Users see a persistent dashboard with service status, uptime, and user count at the top of the menu.

**Independent Test**: Launch interactive mode, verify Dashboard appears at top with correct status.

### Tests for User Story 1

- [x] T009 [P] [US1] Create unit test for `DashboardWidget` rendering in `tests/unit/components/dashboard-widget.test.ts`

### Implementation for User Story 1

- [x] T010 [US1] Implement `DashboardWidget` class in `src/components/dashboard-widget.ts` using `cli-table3`
- [x] T011 [US1] Integrate `SystemdManager` and `UserManager` into `DashboardWidget` for fetching status
- [x] T012 [US1] Implement `render(width)` in `DashboardWidget` to adapt to terminal size and use box characters
- [x] T013 [US1] Update `src/commands/interactive.ts` to initialize `DashboardWidget` and `ScreenManager`
- [x] T014 [US1] Modify main loop in `src/commands/interactive.ts` to call `screenManager.renderHeader()` before menu display
- [x] T015 [US1] Handle "Small Terminals" edge case in `DashboardWidget` (hide details if height < 20 lines)

**Checkpoint**: At this point, the CLI should show a persistent dashboard that updates on redraw.

---

## Phase 4: User Story 2 - Rich User Management Table (Priority: P1)

**Goal**: Users can view users in a structured table with headers and summary rows.

**Independent Test**: Navigate to "List Users" and verify table format with aligned columns.

### Tests for User Story 2

- [x] T016 [P] [US2] Create unit test for `renderUserTable` logic in `tests/unit/components/user-table.test.ts` (or existing user test)

### Implementation for User Story 2

- [x] T017 [US2] Create `src/components/user-table.ts` with `renderUserTable(users, width)` function
- [x] T018 [US2] Implement column alignment logic in `src/components/user-table.ts` using `cli-table3`
- [x] T019 [US2] Implement "Summary Row" logic (limit to top N, show count for rest) in `src/components/user-table.ts`
- [x] T020 [US2] Update `src/commands/user.ts` (listUsers function) to use `renderUserTable`
- [x] T021 [US2] Handle wide vs narrow terminal layouts in `renderUserTable` (hide/show columns)

**Checkpoint**: "List Users" command now displays a responsive, polished table.

---

## Phase 5: User Story 3 - Visual Polish & Navigation (Priority: P2)

**Goal**: Users see breadcrumbs and consistent styling throughout the app.

**Independent Test**: Navigate menus and verify "Home > Submenu" breadcrumb updates.

### Tests for User Story 3

- [x] T022 [P] [US3] Create integration test for breadcrumb updates in `tests/integration/navigation.test.ts` (optional/manual verification emphasis)

### Implementation for User Story 3

- [x] T023 [US3] Integrate `NavigationManager` into `src/commands/interactive.ts` menu flow (push/pop context)
- [x] T024 [US3] Update `ScreenManager` to include `NavigationManager.getBreadcrumb()` in header rendering
- [x] T025 [US3] Apply box-drawing styling to `src/utils/layout.ts` or relevant UI helpers
- [x] T026 [US3] Ensure `ScreenManager.clear()` is called correctly on all context switches (menus, after commands)

**Checkpoint**: Navigation bar works, and the app feels "app-like" with full screen clears.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T027 Verify colors (Green=Active, Red=Inactive) across Dashboard and User Table
- [x] T028 Update `README.md` or `docs/` with new UI description/screenshots (if applicable)
- [x] T029 Manual verification of all User Scenarios on Linux (and Windows if possible)
- [x] T030 Final code cleanup and lint fix

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational (needs Screen/Layout Managers).
- **User Story 2 (Phase 4)**: Independent of US1/US3 logic, but uses shared Layout Manager. Can run parallel to US3 after Foundation.
- **User Story 3 (Phase 5)**: Depends on Foundation (Navigation Manager). Can run parallel to US2.
- **Polish (Phase 6)**: Depends on all stories.

### Parallel Opportunities

- T002, T004, T008 (Interface definitions) can run in parallel.
- T007, T009, T016 (Tests) can run in parallel with implementation (TDD).
- Once Phase 2 is done, User Story 2 (Table) and User Story 3 (Navigation) can be developed in parallel by different devs, while User Story 1 (Dashboard) might overlap with Navigation integration.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Foundation (Phase 2).
2. Implement Dashboard (Phase 3).
3. **STOP**: Verify the new main menu look.

### Incremental Delivery

1. Add User Story 2 (User Table) to improve the specific "List Users" experience.
2. Add User Story 3 (Navigation/Breadcrumbs) to glue the navigation experience together.
3. Final Polish.
