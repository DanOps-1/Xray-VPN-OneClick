# Tasks: 核心功能完善

**Input**: Design documents from `/specs/012-core-features-completion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included as this is a production CLI tool requiring reliability.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new type definitions and path constants needed by all user stories

- [x] T001 [P] Create ServerConfig type definition in src/types/server-config.ts
- [x] T002 [P] Create UserMetadata type definition in src/types/user-metadata.ts
- [x] T003 [P] Add new config file paths (SERVER_CONFIG_PATH, USER_METADATA_PATH) in src/constants/paths.ts
- [x] T004 [P] Add new i18n translations for all new features in src/config/i18n.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services that MUST be complete before user story menu integration

**⚠️ CRITICAL**: No user story menu work can begin until this phase is complete

- [x] T005 Implement PublicIpManager service in src/services/public-ip-manager.ts (getPublicIp, refreshPublicIp, setPublicIp, needsManualInput)
- [x] T006 Implement UserMetadataManager service in src/services/user-metadata-manager.ts (getMetadata, setMetadata, createUser, updateStatus, deleteMetadata, getAllMetadata)
- [x] T007 [P] Add fetchPublicIp utility function with timeout/retry in src/utils/network.ts
- [x] T008 [P] Extend LogManager with readAccessLog(lines), readErrorLog(lines), logExists(type) in src/services/log-manager.ts
- [x] T009 [P] Extend ConfigManager with getFormattedConfig(), listBackups(), restoreFromBackup() in src/services/config-manager.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 获取可用的分享链接 (Priority: P1) 🎯 MVP

**Goal**: 生成的分享链接包含实际公网 IP，而非 "your-server-ip"

**Independent Test**: 生成分享链接并验证链接中包含有效的公网 IP 地址

### Tests for User Story 1

- [ ] T010 [P] [US1] Unit test for PublicIpManager in tests/unit/services/public-ip-manager.test.ts
- [ ] T011 [P] [US1] Integration test for share link generation in tests/integration/share-link.test.ts

### Implementation for User Story 1

- [x] T012 [US1] Integrate PublicIpManager into UserManager.getShareInfo() in src/services/user-manager.ts
- [x] T013 [US1] Add manual IP input prompt when NAT detected or detection fails in src/services/user-manager.ts
- [x] T014 [US1] Update getShareInfo() to use cached/detected public IP instead of hardcoded value in src/services/user-manager.ts

**Checkpoint**: User Story 1 complete - share links now contain valid public IP

---

## Phase 4: User Story 2 - 实时查看系统日志 (Priority: P2)

**Goal**: 管理员可在交互式菜单中查看访问日志和错误日志

**Independent Test**: 进入日志查看菜单，选择日志类型，验证日志内容正确显示

### Tests for User Story 2

- [ ] T015 [P] [US2] Unit test for LogManager extensions in tests/unit/services/log-manager.test.ts
- [ ] T016 [P] [US2] Unit test for logs command in tests/unit/commands/logs.test.ts

### Implementation for User Story 2

- [x] T017 [US2] Implement showLogsMenu() submenu handler in src/commands/logs.ts
- [x] T018 [US2] Implement viewAccessLogs() with 50-line limit and formatting in src/commands/logs.ts
- [x] T019 [US2] Implement viewErrorLogs() with 50-line limit and formatting in src/commands/logs.ts
- [x] T020 [US2] Add log file not found/empty handling with friendly messages in src/commands/logs.ts
- [x] T021 [US2] Connect logs menu to main menu (replace "功能即将推出") in src/commands/interactive.ts

**Checkpoint**: User Story 2 complete - logs menu fully functional

---

## Phase 5: User Story 3 - 管理服务配置 (Priority: P2)

**Goal**: 管理员可通过菜单查看配置、备份和恢复配置

**Independent Test**: 进入配置管理菜单，执行备份操作，验证备份文件生成

### Tests for User Story 3

- [ ] T022 [P] [US3] Unit test for ConfigManager extensions in tests/unit/services/config-manager.test.ts
- [ ] T023 [P] [US3] Unit test for config command in tests/unit/commands/config.test.ts
- [ ] T024 [P] [US3] Integration test for config backup/restore in tests/integration/config-management.test.ts

### Implementation for User Story 3

- [x] T025 [US3] Implement showConfigMenu() submenu handler in src/commands/config.ts
- [x] T026 [US3] Implement viewConfig() with JSON formatting in src/commands/config.ts
- [x] T027 [US3] Implement createBackup() with timestamp naming in src/commands/config.ts
- [x] T028 [US3] Implement restoreConfig() with backup list selection in src/commands/config.ts
- [x] T029 [US3] Add service restart after restore with confirmation in src/commands/config.ts
- [x] T030 [US3] Connect config menu to main menu (replace "功能即将推出") in src/commands/interactive.ts

**Checkpoint**: User Story 3 complete - config management menu fully functional

---

## Phase 6: User Story 4 - 用户状态持久化 (Priority: P3)

**Goal**: 用户创建时间和状态正确保存并显示

**Independent Test**: 创建用户、重启应用、再次查看用户列表，验证创建时间保持不变

### Tests for User Story 4

- [ ] T031 [P] [US4] Unit test for UserMetadataManager in tests/unit/services/user-metadata-manager.test.ts

### Implementation for User Story 4

- [x] T032 [US4] Integrate UserMetadataManager.createUser() into UserManager.addUser() in src/services/user-manager.ts
- [x] T033 [US4] Integrate UserMetadataManager.getMetadata() into UserManager.listUsers() in src/services/user-manager.ts
- [x] T034 [US4] Integrate UserMetadataManager.deleteMetadata() into UserManager.deleteUser() in src/services/user-manager.ts
- [x] T035 [US4] Update user list display to show actual createdAt and status from metadata in src/services/user-manager.ts

**Checkpoint**: User Story 4 complete - user metadata persisted correctly

---

## Phase 7: User Story 5 - 配额自动执行 (Priority: P3)

**Goal**: 管理员可在菜单中手动触发配额检查

**Independent Test**: 在配额管理菜单中执行"检查配额"操作，验证超限用户被正确标记

### Tests for User Story 5

- [ ] T036 [P] [US5] Unit test for executeQuotaCheck command in tests/unit/commands/quota.test.ts

### Implementation for User Story 5

- [x] T037 [US5] Implement executeQuotaCheck() function in src/commands/quota.ts
- [x] T038 [US5] Add enforcement summary display (normal/warning/exceeded counts) in src/commands/quota.ts
- [x] T039 [US5] Add "执行配额检查" menu option to quota management submenu in src/commands/interactive.ts
- [x] T040 [US5] Integrate UserMetadataManager.updateStatus() with QuotaEnforcer results in src/commands/quota.ts

**Checkpoint**: User Story 5 complete - quota enforcement accessible from menu

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T041 Verify all "功能即将推出" placeholders are removed from src/commands/interactive.ts
- [x] T042 Run full test suite: npm test (389 tests passed)
- [x] T043 Run linter: npm run lint (0 errors)
- [ ] T044 Validate quickstart.md scenarios manually
- [x] T045 Update CHANGELOG.md with new features

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (P1): Can proceed independently after Phase 2
  - US2 (P2): Can proceed independently after Phase 2
  - US3 (P2): Can proceed independently after Phase 2
  - US4 (P3): Can proceed independently after Phase 2
  - US5 (P3): Can proceed independently after Phase 2, uses UserMetadataManager from US4
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on PublicIpManager (T005)
- **User Story 2 (P2)**: Depends on LogManager extensions (T008)
- **User Story 3 (P2)**: Depends on ConfigManager extensions (T009)
- **User Story 4 (P3)**: Depends on UserMetadataManager (T006)
- **User Story 5 (P3)**: Depends on UserMetadataManager (T006), can integrate with US4

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in parallel
- Foundational services T007, T008, T009 can run in parallel
- All test tasks within each story can run in parallel
- US2 and US3 can run in parallel (both P2, no dependencies on each other)
- US4 and US5 can run in parallel (both P3, US5 uses same service as US4)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks together:
Task: "Create ServerConfig type definition in src/types/server-config.ts"
Task: "Create UserMetadata type definition in src/types/user-metadata.ts"
Task: "Add new config file paths in src/constants/paths.ts"
Task: "Add new i18n translations in src/config/i18n.ts"
```

## Parallel Example: User Story 2 & 3

```bash
# After Phase 2 complete, launch US2 and US3 in parallel:
# Developer A: User Story 2 (Logs)
Task: "Implement showLogsMenu() in src/commands/logs.ts"

# Developer B: User Story 3 (Config)
Task: "Implement showConfigMenu() in src/commands/config.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational - focus on T005, T007 (PublicIpManager)
3. Complete Phase 3: User Story 1 (T010-T014)
4. **STOP and VALIDATE**: Test share link generation
5. Deploy/demo if ready - users can now get working share links

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Share links work → Deploy (MVP!)
3. Add User Story 2 → Logs menu works → Deploy
4. Add User Story 3 → Config menu works → Deploy
5. Add User Story 4 → User metadata persisted → Deploy
6. Add User Story 5 → Quota check in menu → Deploy
7. Polish → Final release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 45
