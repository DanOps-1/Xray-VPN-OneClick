---

description: "Task list for Open Source Review Recommendations"
---

# Tasks: Open Source Review Recommendations

**Input**: Design documents from `/home/kali/Xray-VPN-OneClick/specs/008-open-source-review/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/
**Tests**: Not requested in the spec; no test tasks included.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Each task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared scaffolding used by all stories

- [x] T001 [P] Define review report domain types (ReviewReport, Summary, AssessmentArea, Finding, Recommendation, EvidenceReference) in `src/types/review.ts`
- [x] T002 [P] Add review enums/constants (priority, time_horizon, status, formats) in `src/constants/review.ts`
- [x] T003 [P] Create repo scan helpers (read-only) in `src/utils/repo-scan.ts`
- [x] T004 [P] Add report ID + timestamp utilities in `src/utils/review-id.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core pipeline required before any story logic

- [x] T005 Implement repo scanning service in `src/services/review/repo-scanner.ts`
- [x] T006 [P] Implement evidence normalization + missing markers in `src/services/review/evidence.ts`
- [x] T007 [P] Implement recommendation filters (priority/time_horizon) in `src/services/review/recommendations-filter.ts`
- [x] T008 Implement review engine orchestration in `src/services/review/review-engine.ts`
- [x] T009 [P] Implement report renderer skeleton (Markdown/JSON sections) in `src/services/review/report-renderer.ts`
- [x] T010 [P] Implement report output writer (stdout + files) in `src/utils/report-output.ts`
- [x] T011 Implement review command skeleton + options in `src/commands/review.ts`
- [x] T012 Register review command in `src/cli.ts`

**Checkpoint**: Foundation ready for user-story implementations

---

## Phase 3: User Story 1 - 维护者获得开源优化评审报告 (Priority: P1) 🎯 MVP

**Goal**: Produce a complete review report with prioritized recommendations, evidence references, and summary.

**Independent Test**: Run the CLI review command on a local repo and verify the report includes all six areas, priority list, evidence links, and one-page summary.

### Implementation for User Story 1

- [x] T013 [P] [US1] Implement documentation evaluator in `src/services/review/areas/documentation.ts`
- [x] T014 [P] [US1] Implement license evaluator in `src/services/review/areas/license.ts`
- [x] T015 [P] [US1] Implement contribution evaluator in `src/services/review/areas/contribution.ts`
- [x] T016 [P] [US1] Implement quality evaluator in `src/services/review/areas/quality.ts`
- [x] T017 [P] [US1] Implement community evaluator in `src/services/review/areas/community.ts`
- [x] T018 [P] [US1] Implement security evaluator in `src/services/review/areas/security.ts`
- [x] T019 [US1] Wire evaluators into the review engine in `src/services/review/review-engine.ts`
- [x] T020 [US1] Implement summary builder (headline, counts, risk notes) in `src/services/review/summary-builder.ts`
- [x] T021 [US1] Render full report + prioritized recommendations (POST /reviews, GET /reviews/{id}) in `src/services/review/report-renderer.ts`
- [x] T022 [US1] Add Markdown/JSON output handling in `src/commands/review.ts`

**Checkpoint**: User Story 1 works end-to-end and is independently usable

---

## Phase 4: User Story 2 - 贡献者判断如何参与 (Priority: P2)

**Goal**: Strengthen contributor-focused guidance and gaps in docs/contribution flow.

**Independent Test**: Run the review and verify the contributor section highlights missing CONTRIBUTING, templates, or guidance with clear recommendations.

### Implementation for User Story 2

- [x] T023 [P] [US2] Enhance README completeness checks in `src/services/review/areas/documentation.ts`
- [x] T024 [P] [US2] Add contribution flow checks (CONTRIBUTING, templates, CoC) in `src/services/review/areas/contribution.ts`
- [x] T025 [US2] Add contributor-focused recommendation grouping in `src/services/review/report-renderer.ts`
- [x] T026 [US2] Add recommendations list output (GET /reviews/{id}/recommendations) in `src/commands/review.ts`

**Checkpoint**: User Story 2 is independently useful for contributors

---

## Phase 5: User Story 3 - 使用者评估可信度 (Priority: P3)

**Goal**: Improve trust signals around licensing, security posture, and maintenance signals.

**Independent Test**: Run the review and verify trust-related findings and a summary-only view support quick decision-making.

### Implementation for User Story 3

- [x] T027 [P] [US3] Add license-type detection and guidance in `src/services/review/areas/license.ts`
- [x] T028 [P] [US3] Add SECURITY.md and disclosure checks in `src/services/review/areas/security.ts`
- [x] T029 [P] [US3] Add CI/testing/release checks in `src/services/review/areas/quality.ts`
- [x] T030 [P] [US3] Add maintenance cadence checks in `src/services/review/areas/community.ts`
- [x] T031 [US3] Add summary-only rendering (GET /reviews/{id}/summary) in `src/services/review/report-renderer.ts`
- [x] T032 [US3] Add `--summary` flag handling in `src/commands/review.ts`

**Checkpoint**: User Story 3 provides trustworthy signals for users

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and finishing touches

- [x] T033 [P] Document the review command in `README.md`
- [x] T034 [P] Add feature usage guide in `docs/open-source-review.md`
- [x] T035 Update release notes in `CHANGELOG.md`

---

## Dependencies & Execution Order

### Dependency Graph (User Stories)

```text
Phase 2 (Foundational)
├── US1 (P1)
├── US2 (P2)
└── US3 (P3)
```

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3–5)**: Depend on Foundational completion; can be parallelized
- **Polish (Phase 6)**: Depends on chosen user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependencies on other stories
- **US2 (P2)**: Starts after Phase 2; independent of US1 but benefits from base report scaffolding
- **US3 (P3)**: Starts after Phase 2; independent of US1/US2

### Parallel Opportunities

- Setup tasks T001–T004 can run in parallel
- Foundational tasks T005–T012 can run in parallel where marked [P]
- US1 evaluators T013–T018 can run in parallel
- US2 tasks T023–T024 can run in parallel
- US3 tasks T027–T030 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Implement documentation evaluator in src/services/review/areas/documentation.ts"
Task: "Implement license evaluator in src/services/review/areas/license.ts"
Task: "Implement contribution evaluator in src/services/review/areas/contribution.ts"
Task: "Implement quality evaluator in src/services/review/areas/quality.ts"
Task: "Implement community evaluator in src/services/review/areas/community.ts"
Task: "Implement security evaluator in src/services/review/areas/security.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Enhance README completeness checks in src/services/review/areas/documentation.ts"
Task: "Add contribution flow checks in src/services/review/areas/contribution.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Add license-type detection in src/services/review/areas/license.ts"
Task: "Add SECURITY.md checks in src/services/review/areas/security.ts"
Task: "Add CI/testing/release checks in src/services/review/areas/quality.ts"
Task: "Add maintenance cadence checks in src/services/review/areas/community.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate US1 independently with a local repo review run

### Incremental Delivery

1. Setup + Foundational → base review command ready
2. Add US1 → deliver MVP report
3. Add US2 → contributor guidance improvements
4. Add US3 → trust and summary enhancements
5. Finish with Polish phase

### Parallel Team Strategy

- Team completes Setup + Foundational together
- After Phase 2:
  - Developer A: US1 tasks
  - Developer B: US2 tasks
  - Developer C: US3 tasks
- Polish tasks can run in parallel with final validations
