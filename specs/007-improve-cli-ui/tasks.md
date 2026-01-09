---
description: "Task list for feature 007-improve-cli-ui"
---

# Tasks: Improve CLI UI Aesthetics

**Input**: Design documents from `/specs/007-improve-cli-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are included as explicitly requested in the plan (Verification Phase).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure and dependencies (`cli-table3`, `chalk`) in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Implement `Theme` object with semantic colors in `src/constants/theme.ts`
- [x] T003 Implement `UI_CONSTANTS` for border styles and indicators in `src/constants/theme.ts`

**Checkpoint**: Foundation ready - Theme constants are defined.

---

## Phase 3: User Story 1 - Refined Dashboard Aesthetics (Priority: P1) 🎯 MVP

**Goal**: Dashboard uses cleaner, lighter borders and subtle status indicators.

**Independent Test**: Launch interactive mode, verify Dashboard border is single line and status is a dot.

### Tests for User Story 1

- [x] T004 [P] [US1] Create unit test for `DashboardWidget` rendering new borders in `tests/unit/components/dashboard-widget.test.ts`

### Implementation for User Story 1

- [x] T005 [US1] Update `src/components/dashboard-widget.ts` to import `THEME` and `UI_CONSTANTS`
- [x] T006 [US1] Change `cli-table3` border style to `'single'` in `src/components/dashboard-widget.ts`
- [x] T007 [US1] Update `render` method in `src/components/dashboard-widget.ts` to use `THEME` colors (replace heavy chalk usage)
- [x] T008 [US1] Replace full-text status coloring with indicator dots + neutral text in `src/components/dashboard-widget.ts`

**Checkpoint**: At this point, the Dashboard should look modern and clean.

---

## Phase 4: User Story 2 - Minimalist Navigation Bar (Priority: P2)

**Goal**: Breadcrumb navigation is clean, without heavy separator lines.

**Independent Test**: Navigate to a submenu, verify breadcrumb is just text without surrounding lines.

### Tests for User Story 2

- [x] T009 [P] [US2] Update `tests/unit/services/screen-manager.test.ts` (if exists) or verify `renderBreadcrumb` manually

### Implementation for User Story 2

- [x] T010 [US2] Update `src/services/screen-manager.ts` to remove `separator` lines in `renderBreadcrumb`
- [x] T011 [US2] Add padding (newlines) to `renderBreadcrumb` in `src/services/screen-manager.ts`
- [x] T012 [US2] Use `THEME.primary` for breadcrumb text in `src/services/screen-manager.ts`

**Checkpoint**: Navigation bar is simplified and cleaner.

---

## Phase 5: User Story 3 - Consistent Color Palette (Priority: P3)

**Goal**: Main menu uses a unified, professional color scheme.

**Independent Test**: View main menu, verify restricted color usage (Neutral labels, Accent icons).

### Tests for User Story 3

- [x] T013 [P] [US3] Manual verification of menu colors (no automated test for color strings usually)

### Implementation for User Story 3

- [x] T014 [US3] Update `getMainMenuOptions` in `src/commands/interactive.ts` to use `THEME` colors
- [x] T015 [US3] Refactor menu icons to use accent colors but keep labels `neutral` in `src/commands/interactive.ts`
- [x] T016 [US3] Update `src/components/user-table.ts` to align headers/colors with the new theme (consistent table look)

**Checkpoint**: The entire interactive experience feels cohesive.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T017 Verify visual consistency between Dashboard and User Table
- [x] T018 Update `README.md` or `docs/` with new screenshots if possible (or just description)
- [x] T019 Manual verification of all User Scenarios on Linux (and Windows if possible)
- [x] T020 Final code cleanup and lint fix

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational (needs Theme).
- **User Story 2 (Phase 4)**: Independent of US1/US3 logic, but uses shared Theme. Can run parallel to US1.
- **User Story 3 (Phase 5)**: Depends on Foundational (Theme). Can run parallel to US1/US2.
- **Polish (Phase 6)**: Depends on all stories.

### Parallel Opportunities

- T004 (Test) can run in parallel with implementation.
- Once Phase 2 is done, US1, US2, and US3 can theoretically be worked on in parallel as they touch different files (Dashboard vs ScreenManager vs Interactive Command).

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Foundation (Phase 2).
2. Implement Dashboard (Phase 3).
3. **STOP**: Verify the new dashboard look.

### Incremental Delivery

1. Add User Story 2 (Navigation) to clean up the header.
2. Add User Story 3 (Menu Colors) to unify the theme.
3. Final Polish.