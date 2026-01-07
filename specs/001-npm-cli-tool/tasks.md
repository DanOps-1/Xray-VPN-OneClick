# Tasks: Xray 服务管理 CLI 工具

**Feature Branch**: `001-npm-cli-tool`
**Input**: Design documents from `/specs/001-npm-cli-tool/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: According to the project constitution (`.specify/memory/constitution.md`), **Test-First Development is MANDATORY** for all core features. Tests MUST be:
1. Written BEFORE implementation
2. Approved by user
3. Run and FAIL (Red)
4. Then implement to pass (Green)
5. Refactor as needed

**Test Priority**: Security features > Core features > Auxiliary features

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure (src/, tests/, bin/)
- [x] T002 Initialize Node.js project with package.json (name: xray-manager, version: 1.0.0)
- [x] T003 [P] Install production dependencies (@inquirer/prompts, commander, chalk@4, ora, clipboardy)
- [x] T004 [P] Install development dependencies (typescript, @types/node, vitest, @vitest/ui, c8, eslint, prettier)
- [x] T005 [P] Configure TypeScript (tsconfig.json) with target ES2020, module commonjs, outDir dist, rootDir src
- [x] T006 [P] Configure Vitest (vitest.config.ts) with c8 coverage provider, 80% thresholds
- [x] T007 [P] Configure ESLint and Prettier
- [x] T008 [P] Configure package.json bin field (xray-manager and xm aliases pointing to dist/cli.js)
- [x] T009 [P] Create .gitignore (node_modules, dist, coverage, .env)
- [x] T010 Add npm scripts (build, dev, test, test:watch, test:coverage, lint, format)

**Checkpoint**: ✅ Basic project structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 [P] Create TypeScript types in src/types/config.ts (XrayConfig, Inbound, Outbound, etc. from data-model.md)
- [x] T012 [P] Create TypeScript types in src/types/service.ts (ServiceStatus, ServiceOperationResult)
- [x] T013 [P] Create TypeScript types in src/types/user.ts (User, CreateUserParams, UserShareInfo)
- [x] T014 [P] Create exit code constants in src/constants/exit-codes.ts (ExitCode enum)
- [x] T015 [P] Create path constants in src/constants/paths.ts (DEFAULT_PATHS)
- [x] T016 [P] Create timeout constants in src/constants/timeouts.ts (TIMEOUTS object)
- [x] T017 [P] Implement validator utils in src/utils/validator.ts (isValidEmail, isValidUuid, isValidPort, etc.)
- [x] T018 [P] Implement format utils in src/utils/format.ts (maskSensitiveValue, formatUptime, formatBytes)
- [x] T019 [P] Implement logger utils in src/utils/logger.ts (console wrappers with chalk colors)

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 安装和启动交互式管理工具 (Priority: P1) 🎯 MVP

**Goal**: 用户通过 npm 全局安装后，运行 `xray-manager` 或 `xm` 启动交互式主菜单

**Independent Test**: 执行 `npm install -g .` 安装工具，运行 `xray-manager` 验证菜单显示并能接受用户输入

### Tests for User Story 1 (MANDATORY per Constitution) ✅

> **CRITICAL: Test-First Development (Constitution Principle IV)**
> These tests MUST be written FIRST, user approved, and FAIL before implementation begins

- [x] T020 [P] [US1] Write integration test for CLI installation in tests/integration/cli-installation.test.ts
- [x] T021 [P] [US1] Write integration test for interactive menu display in tests/integration/interactive-menu.test.ts
- [x] T022 [P] [US1] Write unit test for menu navigation in tests/unit/commands/interactive.test.ts

**Constitution Compliance Checks for Tests:**
- [x] T023 [US1] Verify tests cover menu display (Principle III)
- [x] T024 [US1] Verify tests cover keyboard navigation (Principle II)
- [x] T025 [US1] Verify tests cover graceful exit (Principle III)

### Implementation for User Story 1

- [x] T026 [US1] Create CLI entry point in src/cli.ts with shebang #!/usr/bin/env node
- [x] T027 [US1] Implement preflightChecks function in src/utils/preflight.ts (check systemd, Xray, config)
- [x] T028 [US1] Implement main menu display in src/commands/interactive.ts using @inquirer/prompts select
- [x] T029 [US1] Add menu navigation logic (handle user selection, enter submenu, return to parent)
- [x] T030 [US1] Implement menu stack for back navigation in src/commands/interactive.ts
- [x] T031 [US1] Add graceful exit handler (Ctrl+C confirmation) in src/commands/interactive.ts
- [x] T032 [US1] Add context display (service status, user count) in menu header
- [x] T033 [US1] Implement Commander.js setup for global options (--config, --service, --json, --help, --version)

### Constitution Compliance for User Story 1

- [x] T034 [US1] Security Review: Verify preflight checks don't leak sensitive info (Principle I)
- [x] T035 [US1] Simplicity Check: Verify menu is intuitive with < 3 levels depth (Principle II)
- [x] T036 [US1] Documentation: Add JSDoc comments to all public functions (Principle V)

**Checkpoint**: ✅ User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - 交互式服务状态查看和控制 (Priority: P1) 🎯 MVP

**Goal**: 用户通过菜单查看服务状态（运行中/停止、运行时长、内存等）并能启动/停止/重启服务

**Independent Test**: 启动工具，选择"查看服务状态"验证显示正确；选择"启动/停止/重启服务"验证操作成功

### Tests for User Story 2 (MANDATORY per Constitution) ✅

> **CRITICAL: Write tests FIRST, ensure they FAIL before implementation**

- [ ] T037 [P] [US2] Write unit test for systemctl command validation in tests/unit/services/systemd-manager.test.ts
- [ ] T038 [P] [US2] Write unit test for service status parsing in tests/unit/services/systemd-manager.test.ts
- [ ] T039 [P] [US2] Write integration test for service start/stop/restart in tests/integration/service-lifecycle.test.ts
- [ ] T040 [P] [US2] Write integration test for graceful shutdown strategy in tests/integration/service-lifecycle.test.ts

**Constitution Compliance Checks for Tests:**
- [ ] T041 [US2] Security test: Verify command injection prevention (Principle I - HIGHEST PRIORITY)
- [ ] T042 [US2] Security test: Verify permission detection (Principle I)
- [ ] T043 [US2] Reliability test: Verify timeout handling (Principle III)
- [ ] T044 [US2] Reliability test: Verify graceful shutdown < 10s (FR-016)

### Implementation for User Story 2

- [ ] T045 [P] [US2] Create SystemdManager class in src/services/systemd-manager.ts
- [ ] T046 [US2] Implement isSystemdAvailable method in src/services/systemd-manager.ts
- [ ] T047 [US2] Implement isRoot and canUseSudo methods in src/services/systemd-manager.ts
- [ ] T048 [US2] Implement executeSystemctl method with spawn() in src/services/systemd-manager.ts (validate action/service name)
- [ ] T049 [US2] Implement getStatus method (parse systemctl show output) in src/services/systemd-manager.ts
- [ ] T050 [US2] Implement start method in src/services/systemd-manager.ts
- [ ] T051 [US2] Implement stop method in src/services/systemd-manager.ts
- [ ] T052 [US2] Implement restart method with graceful shutdown (10s timeout) in src/services/systemd-manager.ts
- [ ] T053 [US2] Implement parseSystemdError method in src/services/systemd-manager.ts (map errors to suggestions)
- [ ] T054 [US2] Create service command handler in src/commands/service.ts (integrate with Commander.js)
- [ ] T055 [US2] Add service status display to interactive menu in src/commands/interactive.ts
- [ ] T056 [US2] Add service control actions (start/stop/restart) to interactive menu
- [ ] T057 [US2] Implement progress feedback with Ora spinner during service operations

### Constitution Compliance for User Story 2

- [ ] T058 [US2] Security Review: Verify no hardcoded credentials, input validation (Principle I)
- [ ] T059 [US2] Reliability Check: Verify error messages include suggestions (Principle III)
- [ ] T060 [US2] Documentation: Add usage examples in JSDoc (Principle V)

**Checkpoint**: At this point, User Stories 1 AND 2 (MVP) should both work independently

---

## Phase 5: User Story 3 - 交互式用户管理 (Priority: P2)

**Goal**: 用户通过菜单列出用户、添加/删除用户（自动生成 UUID，自动重启服务）、查看分享链接（脱敏显示）

**Independent Test**: 选择"用户管理"菜单，独立测试添加用户、列出用户、删除用户、显示分享链接

### Tests for User Story 3 (MANDATORY per Constitution) ✅

> **CRITICAL: Write tests FIRST, ensure they FAIL before implementation**

- [ ] T061 [P] [US3] Write unit test for UUID generation in tests/unit/services/user-manager.test.ts
- [ ] T062 [P] [US3] Write unit test for email validation in tests/unit/services/user-manager.test.ts
- [ ] T063 [P] [US3] Write integration test for add user workflow in tests/integration/user-management.test.ts
- [ ] T064 [P] [US3] Write integration test for delete user workflow in tests/integration/user-management.test.ts
- [ ] T065 [P] [US3] Write unit test for sensitive data masking in tests/unit/utils/format.test.ts

**Constitution Compliance Checks for Tests:**
- [ ] T066 [US3] Security test: Verify UUID auto-generation (Principle I - HIGHEST PRIORITY)
- [ ] T067 [US3] Security test: Verify sensitive info masking (前4后4) (Principle I - HIGHEST PRIORITY)
- [ ] T068 [US3] Security test: Verify service restart after user add/delete (Principle I)

### Implementation for User Story 3

- [ ] T069 [P] [US3] Create ConfigManager class in src/services/config-manager.ts
- [ ] T070 [US3] Implement readConfig method in src/services/config-manager.ts (parse JSON)
- [ ] T071 [US3] Implement writeConfig method in src/services/config-manager.ts (set mode 0o600)
- [ ] T072 [US3] Implement validateConfig method in src/services/config-manager.ts
- [ ] T073 [US3] Implement backupConfig method in src/services/config-manager.ts (timestamped backups to /var/backups/xray/)
- [ ] T074 [P] [US3] Create UserManager class in src/services/user-manager.ts
- [ ] T075 [US3] Implement listUsers method in src/services/user-manager.ts (read from config)
- [ ] T076 [US3] Implement addUser method in src/services/user-manager.ts (generate UUID with crypto.randomUUID())
- [ ] T077 [US3] Implement deleteUser method in src/services/user-manager.ts
- [ ] T078 [US3] Implement getShareInfo method in src/services/user-manager.ts (generate VLESS link)
- [ ] T079 [US3] Integrate ConfigManager and SystemdManager in UserManager (auto restart after add/delete)
- [ ] T080 [US3] Implement clipboard copy utility in src/utils/clipboard.ts using clipboardy
- [ ] T081 [US3] Create user command handler in src/commands/user.ts
- [ ] T082 [US3] Add user management submenu to interactive menu in src/commands/interactive.ts
- [ ] T083 [US3] Implement user list display with table format (using console.table or manual formatting)
- [ ] T084 [US3] Implement add user prompt flow in interactive menu
- [ ] T085 [US3] Implement delete user prompt flow with confirmation in interactive menu
- [ ] T086 [US3] Implement share info display with masked values and copy options

### Constitution Compliance for User Story 3

- [ ] T087 [US3] Security Review: Verify all sensitive data masked by default (Principle I)
- [ ] T088 [US3] Security Review: Verify config file permissions set to 600 (Principle I)
- [ ] T089 [US3] Reliability Check: Verify automatic backup before config modification (Principle III)
- [ ] T090 [US3] Documentation: Update README with user management examples (Principle V)

**Checkpoint**: All P1+P2 user stories should now be independently functional

---

## Phase 6: User Story 4 - 交互式配置管理 (Priority: P3)

**Goal**: 用户通过菜单查看配置、备份/恢复配置、修改常用配置项（自动重启服务）

**Independent Test**: 选择"配置管理"菜单，独立测试查看配置、备份、恢复、修改功能

### Tests for User Story 4 (MANDATORY per Constitution) ✅

> **CRITICAL: Write tests FIRST, ensure they FAIL before implementation**

- [ ] T091 [P] [US4] Write unit test for config backup in tests/unit/services/config-manager.test.ts
- [ ] T092 [P] [US4] Write unit test for config restore in tests/unit/services/config-manager.test.ts
- [ ] T093 [P] [US4] Write integration test for backup/restore workflow in tests/integration/config-management.test.ts
- [ ] T094 [P] [US4] Write unit test for config validation in tests/unit/services/config-manager.test.ts

**Constitution Compliance Checks for Tests:**
- [ ] T095 [US4] Security test: Verify backup permissions (Principle I)
- [ ] T096 [US4] Reliability test: Verify restore creates pre-restore backup (Principle III)

### Implementation for User Story 4

- [ ] T097 [US4] Extend ConfigManager with restoreConfig method in src/services/config-manager.ts
- [ ] T098 [US4] Implement listBackups method in src/services/config-manager.ts (scan /var/backups/xray/)
- [ ] T099 [US4] Implement modifyConfigItem method in src/services/config-manager.ts (with validation)
- [ ] T100 [US4] Create config command handler in src/commands/config.ts
- [ ] T101 [US4] Add config management submenu to interactive menu in src/commands/interactive.ts
- [ ] T102 [US4] Implement config display with masked sensitive values
- [ ] T103 [US4] Implement backup list display with timestamps
- [ ] T104 [US4] Implement restore config prompt flow with confirmation
- [ ] T105 [US4] Implement modify config prompt flow (select item, validate input, auto restart)

### Constitution Compliance for User Story 4

- [ ] T106 [US4] Security Review: Verify sensitive config items masked (Principle I)
- [ ] T107 [US4] Reliability Check: Verify auto-restart after config modification (Principle III)
- [ ] T108 [US4] Documentation: Add config management examples (Principle V)

**Checkpoint**: All P1+P2+P3 (partial) user stories functional

---

## Phase 7: User Story 5 - 交互式日志查看 (Priority: P3)

**Goal**: 用户通过菜单实时查看日志、按时间范围/级别过滤日志

**Independent Test**: 选择"查看日志"菜单，独立测试实时日志、历史日志、日志过滤

### Tests for User Story 5 (MANDATORY per Constitution) ✅

> **CRITICAL: Write tests FIRST, ensure they FAIL before implementation**

- [ ] T109 [P] [US5] Write unit test for journalctl command execution in tests/unit/services/log-manager.test.ts
- [ ] T110 [P] [US5] Write unit test for log entry parsing in tests/unit/services/log-manager.test.ts
- [ ] T111 [P] [US5] Write integration test for log viewing in tests/integration/log-viewing.test.ts

**Constitution Compliance Checks for Tests:**
- [ ] T112 [US5] Reliability test: Verify Ctrl+C stops follow mode (Principle III)

### Implementation for User Story 5

- [ ] T113 [P] [US5] Create LogManager class in src/services/log-manager.ts
- [ ] T114 [US5] Implement queryLogs method in src/services/log-manager.ts (use journalctl with args)
- [ ] T115 [US5] Implement followLogs method in src/services/log-manager.ts (stream with -f flag)
- [ ] T116 [US5] Implement parseLogEntry method in src/services/log-manager.ts (extract timestamp, level, message)
- [ ] T117 [US5] Create logs command handler in src/commands/logs.ts
- [ ] T118 [US5] Add logs submenu to interactive menu in src/commands/interactive.ts
- [ ] T119 [US5] Implement real-time log display with color highlighting (errors red, warnings yellow)
- [ ] T120 [US5] Implement log filtering by level (--level flag)
- [ ] T121 [US5] Implement log filtering by time range (--since flag)

### Constitution Compliance for User Story 5

- [ ] T122 [US5] Simplicity Check: Verify log display is easy to read (Principle II)
- [ ] T123 [US5] Documentation: Add log viewing examples (Principle V)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T124 [P] Add comprehensive error handling in all command handlers
- [ ] T125 [P] Implement bilingual error messages (中英文) in src/utils/i18n.ts (optional, or inline)
- [ ] T126 [P] Add input validation across all user input points
- [ ] T127 [P] Implement --json flag support for all commands (output JSON format)
- [ ] T128 [P] Add --verbose flag for detailed logging
- [ ] T129 [P] Add --silent flag for non-interactive mode
- [ ] T130 Update README.md with installation instructions, usage examples, screenshots (Constitution Principle V - MANDATORY)
- [ ] T131 Create CHANGELOG.md documenting version history
- [ ] T132 Add LICENSE file (MIT or project-specific)
- [ ] T133 [P] Run ESLint and fix all linting errors
- [ ] T134 [P] Run Prettier to format all code
- [ ] T135 [P] Verify all unit tests pass with 80% coverage (lines, functions)
- [ ] T136 [P] Verify all integration tests pass
- [ ] T137 [P] Verify E2E tests pass (if implemented)
- [ ] T138 Security hardening review: Verify no hardcoded secrets, proper validation (Constitution Principle I - MANDATORY)
- [ ] T139 Cross-platform compatibility verification: Test on Debian, Ubuntu, CentOS, Kali (Constitution Principle III)
- [ ] T140 Performance testing: Verify menu startup < 500ms, navigation < 100ms (SC-002, SC-003)
- [ ] T141 Final constitution compliance audit: Re-check all 5 Principles

**Checkpoint**: Ready for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P3 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent from US1, but both needed for MVP
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on ConfigManager from US3, but should be independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Uses ConfigManager (may need to extend it)
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Independent from all other stories

### Within Each User Story

- **Tests MUST be written and FAIL before implementation** (Constitution Principle IV)
- Models/Classes before services
- Services before commands
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models/classes within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
# T037, T038, T039, T040 can all be written in parallel

# After tests approved and failing:
# Launch some implementation tasks in parallel:
# T045 (SystemdManager class stub)
# Can be done while others work on T046, T047 (permission checks)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Interactive Menu)
4. Complete Phase 4: User Story 2 (Service Control)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo MVP

**Estimated Time**: ~5-7 days (1 developer, TDD approach)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Partial MVP)
3. Add User Story 2 → Test independently → Deploy/Demo (Full MVP! ✅)
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

**Estimated Time**: ~2-3 weeks (1 developer, TDD approach)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (~1 day)
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3 (or start on User Story 4/5)
3. Stories complete and integrate independently

**Estimated Time**: ~1-1.5 weeks (3 developers, TDD approach)

---

## TDD Workflow (Red-Green-Refactor-Commit)

### Mandatory for ALL User Stories

```bash
# Terminal 1: ALWAYS running
npm run test:watch

# Terminal 2: Development
```

### For Each Task:

1. **RED**: Write test, see it fail
   ```bash
   # Write test in tests/unit/services/systemd-manager.test.ts
   # Watch mode shows ❌ FAIL
   ```

2. **GREEN**: Implement minimum code to pass
   ```typescript
   // Implement in src/services/systemd-manager.ts
   // Watch mode shows ✅ PASS
   ```

3. **REFACTOR**: Improve code quality
   ```typescript
   // Extract functions, improve naming
   // Watch mode confirms ✅ PASS still
   ```

4. **COMMIT**: Save progress
   ```bash
   git add src/ tests/
   git commit -m "feat: implement SystemdManager.getStatus()"
   ```

### Coverage Gates

- Unit tests: 80% lines, 80% functions, 75% branches
- Run before commit: `npm run test:coverage`
- CI/CD will enforce these thresholds

---

## Notes

- **[P] tasks** = different files, no dependencies
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Verify tests fail before implementing** (Red phase)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Summary

- **Total Tasks**: 141
- **Setup**: 10 tasks
- **Foundational**: 9 tasks (BLOCKS all stories)
- **User Story 1 (P1)**: 17 tasks (MVP - Interactive Menu)
- **User Story 2 (P1)**: 24 tasks (MVP - Service Control)
- **User Story 3 (P2)**: 22 tasks (User Management)
- **User Story 4 (P3)**: 12 tasks (Config Management)
- **User Story 5 (P3)**: 11 tasks (Log Viewing)
- **Polish**: 18 tasks

**MVP Scope** (Minimal Viable Product): User Story 1 + User Story 2 = 41 implementation tasks (+ 19 foundational = 60 total)

**Parallel Opportunities**:
- Setup: 7 parallel tasks
- Foundational: 9 parallel tasks
- Per story: 3-8 parallel tasks (tests, models, utils)

**Independent Test Criteria**:
- US1: Run `xray-manager`, verify menu displays
- US2: Select "Service Status", verify display; Select "Restart", verify graceful shutdown
- US3: Select "User Management", verify add/delete/show workflows
- US4: Select "Config Management", verify backup/restore workflows
- US5: Select "Logs", verify real-time and filtered viewing

**Constitution Compliance**: ✅ All 5 Principles enforced through task structure

---

**Generated**: 2026-01-07
**Status**: Ready for implementation
**Estimated Time**: 2-3 weeks (1 developer, TDD), 1-1.5 weeks (3 developers)
**Next Step**: Start with Phase 1 (Setup), then Phase 2 (Foundational), then MVP (US1 + US2)
