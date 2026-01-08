# Tasks: CI/CD Pipeline Polish & Code Quality

**Input**: Design documents from `/specs/004-ci-polish/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Feature Branch**: `004-ci-polish`
**Tech Stack**: TypeScript 5.9+ / Node.js 18+, ESLint 9.39.2, Vitest 4.0.16

**Tests**: This is a maintenance feature that fixes existing code and CI configuration. No new tests are required - all existing 210 tests must continue to pass after each change. Test-first development does not apply to maintenance tasks.

**Organization**: Tasks are grouped by user story (P1-P4) to enable independent implementation and testing of each priority.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify project is ready for maintenance work

- [x] T001 Verify all 210 tests pass before starting maintenance work by running `npm test`
- [x] T002 Verify current lint baseline by running `npm run lint` to confirm 91 issues (57 errors, 34 warnings) - Found: 90 issues (53 errors, 37 warnings)
- [x] T003 Verify CI baseline by checking recent GitHub Actions runs at `.github/workflows/ci.yml` - Latest run: success, has continue-on-error flags

---

## Phase 2: Foundational

**Purpose**: No blocking prerequisites needed - feature branch already exists, project structure is ready

**Note**: This maintenance feature requires no foundational work. Proceed directly to user stories.

---

## Phase 3: User Story 1 - Automated npm Publishing (Priority: P1) 🎯 MVP

**Goal**: Enable automated npm package publishing when version tags are pushed

**Independent Test**: Create a test tag (v1.1.1-test), push to GitHub, verify release workflow attempts to publish (will show clear auth error if token missing, or succeed if properly configured)

### Configuration for User Story 1

- [ ] T004 [US1] Create npm automation token locally using `npm token create --type=automation` - **MANUAL ACTION REQUIRED**
- [ ] T005 [US1] Add NPM_TOKEN to GitHub repository secrets at Settings → Secrets and variables → Actions - **MANUAL ACTION REQUIRED**
- [x] T006 [US1] Verify `.github/workflows/release.yml` uses `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` - Verified at line 58

### Validation for User Story 1

- [ ] T007 [US1] Test setup with dry run by creating tag v1.1.1-test, pushing to GitHub, and monitoring workflow
- [ ] T008 [US1] Clean up test tag using `git tag -d v1.1.1-test && git push origin :refs/tags/v1.1.1-test`
- [ ] T009 [US1] Verify all 210 tests still pass after any workflow changes

**Checkpoint**: NPM_TOKEN configured, automated publishing workflow functional

---

## Phase 4: User Story 2 - Code Quality Compliance (Priority: P2)

**Goal**: Resolve all 91 lint issues (57 errors + 34 warnings) to restore proper code quality gates in CI

**Independent Test**: Run `npm run lint` locally and in CI, expecting zero errors and zero warnings

### Batch 1: Safe Auto-fixes for User Story 2 (~20 issues)

- [x] T010 [US2] Run `npm run lint -- --fix` to automatically fix unused imports and simple issues - Fixed 3 unused eslint-disable directives
- [x] T011 [US2] Review changes with `git diff` to verify auto-fixes are safe - Removed unnecessary eslint-disable comments
- [x] T012 [US2] Fix any remaining unused parameters by prefixing with underscore (e.g., `_next`) - Auto-fix handled available fixes
- [x] T013 [US2] Run `npm test` to verify all 210 tests still pass after Batch 1 - All 210 tests pass
- [x] T014 [US2] Commit Batch 1 changes with message `fix(lint): remove unused imports and fix parameter names` - Committed ec06f3c

### Batch 2: Enum and Variable Cleanup for User Story 2 (~40 issues)

- [x] T015 [P] [US2] Fix unused enum members in `src/types/terminal.ts` (add eslint-disable for public API or remove if truly unused) - Added eslint-disable
- [x] T016 [P] [US2] Fix unused enum members in `src/utils/logger.ts` (LogLevel and OutputMode enums) - Added eslint-disable
- [x] T017 [P] [US2] Fix unused 'error' variable in `src/commands/interactive.ts` - Prefixed with underscore
- [x] T018 [P] [US2] Fix unused 'entry' parameter in `src/services/log-manager.ts` - Prefixed with underscore
- [x] T019 [P] [US2] Fix unused '_error' variables in `src/utils/clipboard.ts` - Removed error parameter entirely
- [x] T020 [P] [US2] Fix unused imports in test files under `tests/integration/` and `tests/unit/` - Removed unused imports
- [x] T021 [US2] Run `npm test` to verify all 210 tests still pass after Batch 2 - All 210 tests pass
- [x] T022 [US2] Commit Batch 2 changes with message `fix(lint): remove unused variables and clean up catch blocks` - Committed e697555

### Batch 3: Type Safety for User Story 2 (~31 issues)

- [ ] T023 [P] [US2] Replace `any` types with proper TypeScript types in `src/services/config-manager.ts`
- [ ] T024 [P] [US2] Replace `any` types in `tests/unit/commands/interactive.test.ts` (use proper mock types)
- [ ] T025 [P] [US2] Replace `any` types in `tests/unit/services/systemd-manager.test.ts` (create mock interfaces)
- [ ] T026 [P] [US2] Replace `any` types in `tests/integration/service-lifecycle.test.ts`
- [ ] T027 [P] [US2] Replace `any` types in `tests/integration/user-management.test.ts`
- [ ] T028 [P] [US2] Fix remaining `any` types in other test files identified by linter
- [ ] T029 [US2] Run `npm test` to verify all 210 tests still pass after Batch 3
- [ ] T030 [US2] Commit Batch 3 changes with message `fix(lint): replace any types with proper TypeScript types`

### Finalize User Story 2

- [ ] T031 [US2] Verify `npm run lint` returns 0 errors and 0 warnings
- [ ] T032 [US2] Remove `continue-on-error: true` from lint step in `.github/workflows/ci.yml`
- [ ] T033 [US2] Remove `continue-on-error: true` from format step in `.github/workflows/ci.yml`
- [ ] T034 [US2] Commit CI changes with message `ci: remove lint workarounds after fixing all issues`
- [ ] T035 [US2] Push changes to 004-ci-polish branch and verify CI lint step passes without errors

**Checkpoint**: All lint issues resolved, CI quality gates restored

---

## Phase 5: User Story 3 - Test Coverage Visibility (Priority: P3)

**Goal**: Display Codecov coverage badge in README for transparency

**Independent Test**: View README on GitHub and verify badge displays current coverage percentage, clicking it navigates to Codecov dashboard

### Implementation for User Story 3

- [ ] T036 [US3] Add Codecov badge to README.md after existing badges using URL `https://codecov.io/gh/DanOps-1/Xray-VPN-OneClick/branch/main/graph/badge.svg`
- [ ] T037 [US3] Verify badge links to Codecov dashboard at `https://codecov.io/gh/DanOps-1/Xray-VPN-OneClick`
- [ ] T038 [US3] Run `npm test` to verify all 210 tests still pass
- [ ] T039 [US3] Commit with message `docs: add Codecov coverage badge to README`
- [ ] T040 [US3] Push to GitHub and verify badge displays correctly in README

**Checkpoint**: Codecov badge visible and functional in README

---

## Phase 6: User Story 4 - CI Performance Optimization (Priority: P4)

**Goal**: Reduce CI run time by at least 20% through caching and parallelization

**Independent Test**: Measure CI run times before and after optimization, verify at least 20% improvement while all tests still pass

### Optimization 1: Parallelization for User Story 4

- [ ] T041 [US4] Measure baseline CI run times from recent GitHub Actions runs (document current metrics)
- [ ] T042 [US4] Edit `.github/workflows/ci.yml` to change build job dependency from `needs: [lint, test]` to `needs: [lint]`
- [ ] T043 [US4] Add comment in ci.yml explaining build can run parallel with tests

### Optimization 2: Caching for User Story 4

- [ ] T044 [US4] Add TypeScript build cache step in `.github/workflows/ci.yml` build job before Setup Node.js
- [ ] T045 [US4] Configure cache to use paths `dist/` and `.tsbuildinfo` with key based on `hashFiles('src/**/*.ts', 'tsconfig.json')`
- [ ] T046 [US4] Add restore-keys for cache fallback to `build-${{ runner.os }}-`

### Validation for User Story 4

- [ ] T047 [US4] Commit optimizations with message `ci: optimize build caching and parallelization`
- [ ] T048 [US4] Push changes to 004-ci-polish branch and trigger CI run
- [ ] T049 [US4] Monitor CI run times and verify 20%+ improvement (target: 48-64s vs baseline 60-80s)
- [ ] T050 [US4] Verify all CI jobs still pass (lint, test on Node 18/20/22, build)
- [ ] T051 [US4] Verify coverage still uploads to Codecov successfully

**Checkpoint**: CI optimized, run time reduced by ≥20%, all functionality preserved

---

## Phase 7: Polish & Final Validation

**Purpose**: Cross-story validation and documentation

- [ ] T052 [P] Run full test suite locally one final time to ensure all 210 tests pass
- [ ] T053 [P] Run `npm run lint` to confirm 0 errors and 0 warnings
- [ ] T054 [P] Verify README.md displays all badges correctly (npm version, CI status, Codecov)
- [ ] T055 Verify automated npm publishing works by reviewing NPM_TOKEN configuration
- [ ] T056 Review all commits follow conventional commit format
- [ ] T057 Update CLAUDE.md if needed with any ESLint or CI optimization details
- [ ] T058 Create PR from 004-ci-polish to main branch with summary of all improvements
- [ ] T059 Verify PR passes all CI checks without continue-on-error flags
- [ ] T060 Merge PR to main after approval

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Not applicable for this maintenance feature
- **User Story 1 (Phase 3)**: Can start immediately after Setup
- **User Story 2 (Phase 4)**: Independent of US1, can run in parallel or after
- **User Story 3 (Phase 5)**: Independent of US1 and US2, can run in parallel or after
- **User Story 4 (Phase 6)**: Should run after US2 (lint fixes) to ensure CI optimizations work with clean code
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - can start immediately
- **User Story 2 (P2)**: No dependencies on US1 - can run in parallel
- **User Story 3 (P3)**: No dependencies on US1 or US2 - can run in parallel
- **User Story 4 (P4)**: Recommended after US2 (lint fixes restored) but can run independently

### Within Each User Story

**User Story 1 (NPM Token)**:
- Sequential: T004 → T005 → T006 → T007 → T008 → T009

**User Story 2 (Lint Fixes)**:
- Batch 1: Sequential (T010 → T011 → T012 → T013 → T014)
- Batch 2: T015-T020 can run in parallel [P], then T021 → T022
- Batch 3: T023-T028 can run in parallel [P], then T029 → T030
- Finalize: Sequential (T031 → T032 → T033 → T034 → T035)

**User Story 3 (Codecov Badge)**:
- Sequential: T036 → T037 → T038 → T039 → T040

**User Story 4 (CI Optimization)**:
- Sequential: T041 → T042 → T043 → T044 → T045 → T046 → T047 → T048 → T049 → T050 → T051

### Parallel Opportunities

**Across User Stories**:
- US1, US2, and US3 can all run in parallel (different files, independent validation)
- US4 should ideally wait for US2 (lint fixes) to complete

**Within User Story 2**:
```bash
# Batch 2 - can launch in parallel:
Task T015: Fix src/types/terminal.ts
Task T016: Fix src/utils/logger.ts
Task T017: Fix src/commands/interactive.ts
Task T018: Fix src/services/log-manager.ts
Task T019: Fix src/utils/clipboard.ts
Task T020: Fix test files

# Batch 3 - can launch in parallel:
Task T023: Fix src/services/config-manager.ts
Task T024: Fix tests/unit/commands/interactive.test.ts
Task T025: Fix tests/unit/services/systemd-manager.test.ts
Task T026: Fix tests/integration/service-lifecycle.test.ts
Task T027: Fix tests/integration/user-management.test.ts
Task T028: Fix remaining test files
```

**Polish Phase**:
- T052, T053, T054 can run in parallel [P]

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify baseline)
2. Complete Phase 3: User Story 1 (NPM Token configuration)
3. **STOP and VALIDATE**: Test by creating a test tag and verifying workflow
4. Minimal viable improvement achieved: automated publishing works

### Incremental Delivery (Recommended)

1. Phase 1: Setup → Baseline verified
2. Phase 3: User Story 1 → NPM Token configured (highest priority, immediate need)
3. Phase 4: User Story 2 → All lint issues fixed (high priority, restores quality gates)
4. Phase 5: User Story 3 → Codecov badge added (medium priority, improves transparency)
5. Phase 6: User Story 4 → CI optimized (lower priority, quality-of-life improvement)
6. Phase 7: Polish → Final validation and merge

Each phase delivers value independently and doesn't break previous work.

### Sequential Strategy (Safest)

Execute user stories in priority order (P1 → P2 → P3 → P4) with full validation after each:

1. US1 (NPM Token) → Test → Commit
2. US2 (Lint Fixes) → Test → Commit
3. US3 (Badge) → Test → Commit
4. US4 (CI Optimization) → Test → Commit
5. Polish → Final validation → Merge

### Parallel Strategy (Fastest)

If multiple developers or confident in independent changes:

1. Complete Setup together
2. Split work:
   - Developer A: User Story 1 (T004-T009)
   - Developer B: User Story 2 Batch 1 (T010-T014)
   - Developer C: User Story 3 (T036-T040)
3. Sync and integrate
4. User Story 2 Batch 2 & 3 (can parallelize tasks within each batch)
5. User Story 4 (after lint fixes complete)
6. Polish together

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to run in parallel
- **Test Safety**: Run `npm test` after each batch to ensure all 210 tests pass
- **Incremental Commits**: Commit after each batch/story for easy rollback if needed
- **Constitution Compliance**:
  - ✅ Principle I (Security): NPM_TOKEN stored as GitHub secret, never logged
  - ✅ Principle II (Simplicity): Auto-fix used where possible (`--fix` flag)
  - ✅ Principle III (Reliability): All 210 tests must pass after each change
  - ✅ Principle IV (Test-First): Not applicable for maintenance tasks - existing tests validate
  - ✅ Principle V (Documentation): README updated, CLAUDE.md updated, CI documented
- **Risk Mitigation**: 3-batch approach for lint fixes reduces risk of introducing bugs
- **Performance Target**: CI run time should reduce from ~60-80s to ~48-64s (20-25% improvement)
- **Success Criteria**: All 7 success criteria from spec.md must be met before merging

---

## Validation Checklist

Before merging to main, verify:

- [ ] **SC-001**: Automated npm publishing succeeds within 30 seconds of pushing a version tag
- [ ] **SC-002**: Code linting completes with zero errors and zero warnings (down from 91 issues)
- [ ] **SC-003**: CI lint step passes without `continue-on-error` flag
- [ ] **SC-004**: README displays a Codecov badge showing coverage percentage above 80%
- [ ] **SC-005**: Average CI run time reduces by at least 20% from baseline (~20 seconds)
- [ ] **SC-006**: All 210 existing tests continue to pass after all changes
- [ ] **SC-007**: Coverage upload to Codecov succeeds in 95% of CI runs
