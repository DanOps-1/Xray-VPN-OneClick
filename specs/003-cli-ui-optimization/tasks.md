# Tasks: CLI User Interface Optimization

**Input**: Design documents from `/specs/003-cli-ui-optimization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: According to the project constitution (`.specify/memory/constitution.md`), **Test-First Development is MANDATORY** for all core features. Tests MUST be:
1. Written BEFORE implementation
2. Approved by user
3. Run and FAIL (Red)
4. Then implement to pass (Green)
5. Refactor as needed

**Test Priority**: Security features > Core features > Auxiliary features

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths assume TypeScript CLI tool structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic file structure

- [x] T001 Create new type definitions file `src/types/terminal.ts` with Platform enum and TerminalCapabilities interface
- [x] T002 [P] Create UI symbols constants file `src/constants/ui-symbols.ts` (stub, to be populated later)
- [x] T003 [P] Create test directories structure: `tests/unit/` and update test configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core terminal detection and icon resolution infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement terminal capability detection in `src/utils/terminal.ts` with `detectTerminalCapabilities()`, `isWindows()`, and `supportsUnicode()` functions
- [x] T005 Implement icon resolver in `src/utils/icons.ts` with `resolveIcon()`, `getStatusIndicator()`, and `getMenuIcon()` functions
- [x] T006 Populate `src/constants/ui-symbols.ts` with STATUS_INDICATORS map (SUCCESS, ERROR, WARN, INFO, DEBUG, LOADING, PROGRESS, HINT) and MENU_ICONS map (STATUS, START, STOP, RESTART, USER, CONFIG, LOGS, EXIT)
- [x] T007 Add OutputMode enum (RICH, PLAIN_TTY, PIPE) to `src/utils/logger.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 3 - Accessible Status Indicators (Priority: P1) 🎯 MVP

**Goal**: Replace emoji-based status indicators with text-based indicators that work universally across all terminal types

**Independent Test**: Run service start/stop operations on a monochrome terminal (with `--no-color`) and verify that success/failure states are distinguishable through text patterns alone ([OK], [ERROR], [WARN])

**Why P1 First**: This is the most critical functional change - status indicators affect operational safety. Users need to know if commands succeeded or failed.

### Tests for User Story 3 (MANDATORY per Constitution) ✅

> **CRITICAL: Test-First Development (Constitution Principle IV)**
> These tests MUST be written FIRST, user approved, and FAIL before implementation begins

- [x] T008 [P] [US3] Write unit test for logger status indicators in `tests/unit/logger.test.ts` - test all log levels (success, error, warn, info, debug) output correct text indicators in different output modes
- [x] T009 [P] [US3] Write unit test for icon resolver in `tests/unit/icons.test.ts` - test resolveIcon() returns correct Unicode/ASCII based on terminal capabilities
- [x] T010 [P] [US3] Write integration test for TTY detection in `tests/integration/ui-compatibility.test.ts` - spawn CLI process with/without TTY and verify output format

**Constitution Compliance Checks for Tests:**
- [x] Security test coverage for sensitive operations (Principle I) - N/A, no sensitive operations
- [x] Error handling test scenarios (Principle III) - Covered in logger tests
- [x] Cross-platform compatibility tests (Principle III) - Covered in integration test

### Implementation for User Story 3

- [x] T011 [US3] Refactor `src/utils/logger.ts` - Add `getOutputMode()` function to detect current output mode (RICH/PLAIN_TTY/PIPE) based on isTTY and color settings
- [x] T012 [US3] Update `success()` function in `src/utils/logger.ts` - Replace emoji `✅` with icon from resolveIcon(LogLevel.SUCCESS)
- [x] T013 [US3] Update `error()` function in `src/utils/logger.ts` - Replace emoji `❌` with icon from resolveIcon(LogLevel.ERROR)
- [x] T014 [US3] Update `warn()` function in `src/utils/logger.ts` - Replace emoji `⚠️` with icon from resolveIcon(LogLevel.WARN)
- [x] T015 [US3] Update `hint()` function in `src/utils/logger.ts` - Replace emoji `💡` with icon from resolveIcon(LogLevel.HINT)
- [x] T016 [US3] Update `loading()` function in `src/utils/logger.ts` - Replace emoji `⏳` with icon from resolveIcon(LogLevel.LOADING)
- [x] T017 [US3] Update `progress()` function in `src/utils/logger.ts` - Replace emoji `🔄` with icon from resolveIcon(LogLevel.PROGRESS)
- [x] T018 [US3] Add pipe mode formatting to logger - When !isTTY, output `[timestamp] [LEVEL] message` format without ANSI codes
- [x] T019 [US3] Update `formatMessage()` in `src/utils/logger.ts` - Integrate output mode detection and apply appropriate formatting (Rich/Plain/Pipe)

### Constitution Compliance for User Story 3

- [x] T020 [US3] Security Review: Verify logger does not output sensitive information (passwords, keys, tokens) in any output mode (Constitution Principle I)
- [x] T021 [US3] Simplicity Check: Verify logger auto-detects terminal capabilities without requiring user configuration (Constitution Principle II)
- [x] T022 [US3] Documentation: Add JSDoc comments to all modified logger functions explaining new behavior (Constitution Principle V)

**Checkpoint**: At this point, all logger output should use text indicators. Status messages are now universally readable.

---

## Phase 4: User Story 1 - Universal System Compatibility (Priority: P1)

**Goal**: Ensure CLI displays correctly on Windows CMD, legacy terminals, and minimal SSH sessions by replacing all emoji with compatible text

**Independent Test**: Launch CLI on Windows CMD (CP936 encoding) and verify main menu displays without garbled characters or emoji boxes

**Why After US3**: US3 provides the foundation (logger refactor). US1 extends this to menu items and CLI entry point.

### Tests for User Story 1 (MANDATORY per Constitution) ✅

> **CRITICAL: Write tests FIRST, ensure they FAIL before implementation**

- [ ] T023 [P] [US1] Write unit test for terminal capabilities in `tests/unit/terminal.test.ts` - mock different platforms (win32, linux, darwin) and TERM values, verify supportsUnicode detection
- [ ] T024 [P] [US1] Write integration test for Windows CMD compatibility in `tests/integration/ui-compatibility.test.ts` - mock Windows environment and verify no Unicode characters in ASCII-only mode
- [ ] T025 [P] [US1] Write integration test for menu display in `tests/integration/ui-compatibility.test.ts` - verify menu options contain text indicators within 80 columns

### Implementation for User Story 1

- [ ] T026 [US1] Update CLI entry point `src/cli.ts` line 106 - Replace emoji `👋` in SIGINT handler with text "[退出]"
- [ ] T027 [P] [US1] Update `src/commands/service.ts` - Replace any inline emoji with icons from menuIcons constant
- [ ] T028 [P] [US1] Update `src/commands/user.ts` - Replace emoji `✅` in success messages (lines 89, 132) with logger.success() call
- [ ] T029 [P] [US1] Update `src/commands/config.ts` - Replace all emoji (⚙️, ✅, 💡) with appropriate icons from menuIcons and statusIcons
- [ ] T030 [US1] Update `src/commands/logs.ts` - Refactor `getEmojiForLevel()` function (line 183) to use `resolveIcon()` from icons util, update menu options (line 267) to use text indicators

### Constitution Compliance for User Story 1

- [ ] T031 [US1] Cross-platform Testing: Manually test on Windows CMD, Linux terminal, and SSH session - verify no garbled characters (Constitution Principle III)
- [ ] T032 [US1] Documentation: Update README.md with supported terminal types and minimum requirements (Constitution Principle V)

**Checkpoint**: At this point, ALL CLI output (logger + commands) should be compatible with ASCII-only terminals.

---

## Phase 5: User Story 2 - Improved Visual Hierarchy (Priority: P2)

**Goal**: Enhance menu organization with clear text-based grouping and prefixes for better scannability

**Independent Test**: Show main menu to a new user and time how long it takes to locate "Add User" function - should be under 5 seconds

**Why P2**: This is a UX improvement that builds on US1/US3. Functionality is already complete, this enhances visual design.

### Tests for User Story 2 (MANDATORY per Constitution) ✅

> **CRITICAL: Write tests FIRST, ensure they FAIL before implementation**

- [ ] T033 [P] [US2] Write unit test for menu option formatting in `tests/unit/icons.test.ts` - verify menu icons follow `[标签]` format and are ≤6 characters
- [ ] T034 [P] [US2] Write integration test for menu grouping in `tests/integration/ui-compatibility.test.ts` - verify separator lines and category prefixes are present

### Implementation for User Story 2

- [ ] T035 [US2] Refactor main menu in `src/commands/interactive.ts` - Replace emoji in all menu options (lines 145-175) with text icons using menuIcons constant: STATUS→[查看], START→[启动], STOP→[停止], RESTART→[重启], USER→[用户], CONFIG→[配置], LOGS→[日志], EXIT→[退出]
- [ ] T036 [US2] Add visual grouping to main menu in `src/commands/interactive.ts` - Insert separator lines between functional categories (service operations, management, exit)
- [ ] T037 [US2] Update menu icon helper in `src/commands/interactive.ts` - Refactor `getIconForValue()` function (line 202-207) to use menuIcons constant instead of hardcoded emoji
- [ ] T038 [US2] Update submenu displays in `src/commands/interactive.ts` - Ensure all submenus (user management, config management, logs) use consistent text prefixes and separators

### Constitution Compliance for User Story 2

- [ ] T039 [US2] Simplicity Check: Verify menu remains intuitive and doesn't require learning curve - test with non-technical user (Constitution Principle II)
- [ ] T040 [US2] Documentation: Add screenshots or ASCII art examples of new menu layout to README (Constitution Principle V)

**Checkpoint**: Menu navigation should now be visually organized and easy to scan.

---

## Phase 6: User Story 4 - Consistent Terminal Interaction (Priority: P3)

**Goal**: Ensure proper formatting, alignment, and spacing across different terminal widths (80-160 columns)

**Independent Test**: Run CLI in terminals of 80, 120, and 160 columns width - verify no horizontal scrolling and proper alignment

**Why P3**: Polish and refinement. Core functionality complete, this ensures professional appearance across all environments.

### Tests for User Story 4 (MANDATORY per Constitution) ✅

> **CRITICAL: Write tests FIRST, ensure they FAIL before implementation**

- [ ] T041 [P] [US4] Write unit test for width constraints in `tests/unit/terminal.test.ts` - verify detected width has minimum of 40 and defaults to 80
- [ ] T042 [P] [US4] Write integration test for 80-column layout in `tests/integration/ui-compatibility.test.ts` - mock 80-column terminal and verify no line exceeds width

### Implementation for User Story 4

- [ ] T043 [US4] Add width validation to logger in `src/utils/logger.ts` - Check terminal width in formatMessage() and truncate or wrap lines exceeding maxWidth (default 80)
- [ ] T044 [US4] Update table formatting in `src/utils/logger.ts` - Adjust tableHeader() function (line 154) to respect terminal width, ensure borders don't exceed 80 columns
- [ ] T045 [US4] Review all menu text in `src/commands/interactive.ts` - Ensure longest menu option text ≤60 characters (allowing for icons and padding within 80 columns)
- [ ] T046 [US4] Add spacing consistency to logger in `src/utils/logger.ts` - Ensure consistent use of newline() between operations for visual separation

### Constitution Compliance for User Story 4

- [ ] T047 [US4] Cross-platform Testing: Test with COLUMNS=80 environment variable on Linux and verify layout (Constitution Principle III)
- [ ] T048 [US4] Performance Check: Verify CLI startup time remains <2 seconds after all changes (Constitution Principle III)

**Checkpoint**: All user stories complete. CLI now provides consistent, professional terminal interaction.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final testing, documentation, and compliance verification

- [ ] T049 [P] Run full test suite with coverage: `npm run test:coverage` - ensure >80% coverage for new modules (terminal, icons)
- [ ] T050 [P] ESLint check: `npm run lint` - fix any linting errors in modified files
- [ ] T051 [P] Type check: `npm run build` - ensure TypeScript compilation succeeds without errors
- [ ] T052 Manual testing checklist - Execute all scenarios from spec.md acceptance criteria on real environments (Windows CMD, Linux, macOS, SSH)
- [ ] T053 Performance benchmark - Measure CLI startup time and menu response time, verify <2s and <100ms respectively
- [ ] T054 Security audit - Review all logger output to confirm no sensitive data (passwords, tokens, IPs) ever logged (Constitution Principle I)
- [ ] T055 [P] Update README.md - Add "Terminal Compatibility" section documenting supported terminals, known limitations, and troubleshooting tips (Constitution Principle V)
- [ ] T056 [P] Update CHANGELOG.md - Document all UI changes, emoji replacements, and new terminal detection features
- [ ] T057 Final constitution compliance audit - Verify all 5 principles (Security, Simplicity, Reliability, Testing, Documentation) are satisfied
- [ ] T058 Create release notes for feature branch - Summarize changes, breaking changes (none expected), migration guide (none needed)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL USER STORIES
    ↓
    ├──→ Phase 3 (US3 - Status Indicators, P1) 🎯 MVP
    │        ↓
    │    Phase 4 (US1 - System Compatibility, P1)
    │        ↓
    ├──→ Phase 5 (US2 - Visual Hierarchy, P2)
    │        ↓
    └──→ Phase 6 (US4 - Terminal Consistency, P3)
         ↓
Phase 7 (Polish)
```

### User Story Independence

- **US3 (Status Indicators)**: Fully independent after Phase 2, can be implemented and tested alone
- **US1 (System Compatibility)**: Depends on US3 (uses refactored logger), extends to all commands
- **US2 (Visual Hierarchy)**: Independent of US3, depends on US1 (menu emoji replacement)
- **US4 (Terminal Consistency)**: Independent, can run parallel with US2

### Parallel Execution Opportunities

**After Phase 2 completion:**

- **Scenario 1 (Sequential by Priority)**:
  ```
  Phase 3 (US3) → Phase 4 (US1) → Phase 5 (US2) & Phase 6 (US4) in parallel → Phase 7
  ```

- **Scenario 2 (Maximum Parallelization, Multiple Developers)**:
  ```
  Phase 3 (US3) alone first (foundation)
  ↓
  Phase 4 (US1) + Phase 5 (US2, partial) + Phase 6 (US4) in parallel
  ↓
  Phase 7 (Polish)
  ```

**Within Each Phase:**

- Phase 3: T008, T009, T010 can run in parallel (test files)
- Phase 4: T027, T028, T029 can run in parallel (different command files)
- Phase 5: T033, T034 can run in parallel (test files)
- Phase 6: T041, T042 can run in parallel (test files)
- Phase 7: T049, T050, T051, T055, T056 can run in parallel (different activities)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP: Phase 3 (US3) Only**

Delivers:
- ✅ Core functionality: Status indicators work universally
- ✅ Critical user value: Operational safety (know if commands succeed/fail)
- ✅ Independently testable and deployable
- ✅ Estimated effort: ~2-3 days (foundation + US3)

User can validate this works on their problem terminals before proceeding with remaining stories.

### Full Feature Scope

**Complete Implementation: All Phases**

Delivers:
- ✅ US3: Status indicators (P1)
- ✅ US1: System compatibility (P1)
- ✅ US2: Visual hierarchy (P2)
- ✅ US4: Terminal consistency (P3)
- ✅ Estimated effort: ~5-7 days total

### Incremental Delivery Plan

1. **Sprint 1**: Phase 1-3 (Setup + Foundation + US3) → Deploy MVP
2. **Sprint 2**: Phase 4 (US1) → Deploy P1 complete
3. **Sprint 3**: Phase 5-6 (US2 + US4) → Deploy full feature
4. **Sprint 4**: Phase 7 (Polish) → Final release

Each sprint delivers working, testable increment.

---

## Task Summary

**Total Tasks**: 58

**Task Breakdown by Phase:**
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (US3 - P1 MVP): 15 tasks (3 tests + 9 impl + 3 compliance)
- Phase 4 (US1 - P1): 10 tasks (3 tests + 5 impl + 2 compliance)
- Phase 5 (US2 - P2): 8 tasks (2 tests + 4 impl + 2 compliance)
- Phase 6 (US4 - P3): 8 tasks (2 tests + 4 impl + 2 compliance)
- Phase 7 (Polish): 10 tasks

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel with other tasks

**Test Coverage**: 10 dedicated test tasks (17% of total), covering unit, integration, and manual testing

**Constitution Compliance**: All 5 principles verified across user stories

---

## Format Validation ✅

All tasks follow required format:
- ✅ Checkbox prefix (`- [ ]`)
- ✅ Task ID (T001-T058 in execution order)
- ✅ [P] marker for parallelizable tasks
- ✅ [Story] label for user story tasks (US1, US2, US3, US4)
- ✅ Clear descriptions with exact file paths
