# Feature Specification: CI/CD Pipeline Polish & Code Quality

**Feature Branch**: `004-ci-polish`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "按顺序执行：1. 立即需要: 设置 GitHub secret NPM_TOKEN 以启用自动发布 2. 高优先级: 修复 91 个 lint 问题 3. 中优先级: 添加 Codecov badge 到 README 4. 低优先级: 优化 CI 运行时间"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automated npm Publishing (Priority: P1)

As a project maintainer, I need the CI/CD pipeline to automatically publish npm packages when I push a version tag, so that I don't have to manually publish packages and can ensure consistent release processes.

**Why this priority**: This is the highest priority because it completes the automated release workflow that was already set up. Without the NPM_TOKEN configured, the automatic publishing workflow is non-functional, requiring manual intervention for every release.

**Independent Test**: Can be fully tested by creating a test tag in a fork/test environment and verifying the workflow attempts to publish to npm (or succeeds if token is configured).

**Acceptance Scenarios**:

1. **Given** the NPM_TOKEN secret is not configured, **When** I push a version tag (e.g., v1.2.0), **Then** the release workflow runs but the npm publish step fails with a clear authentication error
2. **Given** the NPM_TOKEN secret is properly configured, **When** I push a version tag, **Then** the package is automatically published to npm registry with provenance
3. **Given** a published package on npm, **When** I check the package page, **Then** it shows the correct version and includes provenance information

---

### User Story 2 - Code Quality Compliance (Priority: P2)

As a developer, I need the codebase to pass all linting checks without warnings or errors, so that the code maintains consistent quality standards and the CI pipeline accurately reflects code health.

**Why this priority**: High priority because 91 lint issues represent technical debt that can hide real problems. The current CI uses `continue-on-error` as a temporary workaround, which defeats the purpose of automated quality checks.

**Independent Test**: Can be fully tested by running `npm run lint` locally and in CI, expecting zero errors and zero warnings.

**Acceptance Scenarios**:

1. **Given** the current codebase with 91 lint issues, **When** I run `npm run lint`, **Then** all 57 errors and 34 warnings are resolved
2. **Given** all lint issues are fixed, **When** CI runs the lint step, **Then** it passes without requiring `continue-on-error`
3. **Given** a developer commits new code with lint violations, **When** the CI runs, **Then** the build fails and provides clear feedback about the violations

---

### User Story 3 - Test Coverage Visibility (Priority: P3)

As a project maintainer, I need a coverage badge displayed in the README, so that contributors and users can quickly see the project's test coverage status without navigating to external services.

**Why this priority**: Medium priority because it improves project transparency and encourages maintaining high test coverage. It's valuable but doesn't block development or releases.

**Independent Test**: Can be fully tested by viewing the README on GitHub and verifying the badge displays current coverage percentage.

**Acceptance Scenarios**:

1. **Given** the README file, **When** I view it on GitHub, **Then** I see a Codecov badge showing the current test coverage percentage
2. **Given** the test suite runs in CI, **When** coverage is uploaded to Codecov, **Then** the badge automatically updates to reflect the new coverage
3. **Given** I click on the coverage badge, **When** the link opens, **Then** it navigates to the Codecov dashboard for detailed coverage reports

---

### User Story 4 - CI Performance Optimization (Priority: P4)

As a developer, I need the CI pipeline to run faster, so that I receive feedback more quickly and can iterate on changes more efficiently.

**Why this priority**: Lower priority because the CI currently works correctly, just slower than optimal. This is a quality-of-life improvement that doesn't block functionality.

**Independent Test**: Can be fully tested by measuring CI run times before and after optimization, expecting measurable improvement.

**Acceptance Scenarios**:

1. **Given** the current CI configuration, **When** I measure the average total run time, **Then** I establish a baseline (currently ~20 seconds per job)
2. **Given** optimizations are applied, **When** CI runs complete, **Then** the total run time is reduced by at least 20%
3. **Given** optimized CI runs, **When** they complete, **Then** all tests still pass and coverage is still reported correctly

---

### Edge Cases

- What happens when the NPM_TOKEN expires or is revoked? → The publish step should fail with a clear error message indicating authentication failure
- How does the system handle lint errors introduced in new commits? → CI must fail to prevent merging code with quality issues
- What if Codecov service is unavailable? → CI should continue successfully but skip coverage upload (already configured with `fail_ci_if_error: false`)
- What if optimization changes break existing functionality? → All 210 tests must still pass as validation

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store NPM_TOKEN as a GitHub repository secret with appropriate access controls
- **FR-002**: System MUST authenticate to npm registry using the stored token during automated releases
- **FR-003**: Developers MUST be able to resolve all 57 lint errors without breaking existing functionality
- **FR-004**: Developers MUST be able to resolve all 34 lint warnings without breaking existing functionality
- **FR-005**: System MUST remove `continue-on-error: true` from lint and format CI steps after all issues are fixed
- **FR-006**: README MUST display a Codecov coverage badge that links to the coverage dashboard
- **FR-007**: System MUST upload coverage reports to Codecov after test runs (already implemented for Node.js 20)
- **FR-008**: CI pipeline MUST maintain or improve current run times after optimizations
- **FR-009**: System MUST preserve all existing test passes (210/210) after any changes

### Constitution Compliance Requirements

根据项目宪章 (`.specify/memory/constitution.md`)，以下要求是强制性的：

- **CR-001**: 安全性 - NPM_TOKEN 必须存储为加密的 GitHub secret，不得硬编码或提交到仓库
- **CR-002**: 简洁性 - Lint 修复应优先使用自动修复工具（`--fix`），减少手动工作
- **CR-003**: 可靠性 - 所有更改必须保持 210 个测试全部通过，确保功能不被破坏
- **CR-004**: 测试 - CI 优化后必须验证所有 CI jobs 仍然正确执行
- **CR-005**: 文档 - README 更新（添加 badge）必须清晰、美观、准确

### Key Entities

- **GitHub Secret**: Encrypted storage for NPM_TOKEN, accessible only to authorized workflows
- **Lint Issue**: Code quality violation (error or warning) detected by ESLint
- **Coverage Report**: Test coverage data generated by Vitest and uploaded to Codecov
- **CI Job**: Individual workflow step (lint, test, build) that can be independently optimized

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Automated npm publishing succeeds within 30 seconds of pushing a version tag
- **SC-002**: Code linting completes with zero errors and zero warnings (down from 91 issues)
- **SC-003**: CI lint step passes without `continue-on-error` flag
- **SC-004**: README displays a Codecov badge showing coverage percentage above 80%
- **SC-005**: Average CI run time reduces by at least 20% from current baseline (~20 seconds)
- **SC-006**: All 210 existing tests continue to pass after all changes
- **SC-007**: Coverage upload to Codecov succeeds in 95% of CI runs

## Assumptions

- NPM account already exists with publish permissions for `xray-manager` package
- Codecov account is already set up and integrated with the repository
- GitHub Actions has necessary permissions to access repository secrets
- Current lint issues can be fixed without major code refactoring
- CI optimization opportunities exist (caching, parallelization, dependency pruning)

## Dependencies

- External: npm registry, Codecov service, GitHub Actions infrastructure
- Internal: Existing CI workflows (`.github/workflows/ci.yml`, `.github/workflows/release.yml`)
- Configuration: ESLint configuration (`.eslintrc` or `eslint.config.mjs`), Codecov configuration

## Out of Scope

- Adding new tests (focus is on fixing existing issues)
- Upgrading major dependencies (unless required for optimizations)
- Changing test framework or linting tools
- Implementing new CI workflows (only optimizing existing ones)
- Modifying package publishing process beyond adding authentication

## Risks

- **Risk 1**: Fixing lint issues might introduce bugs
  - Mitigation: Run full test suite after each fix, review changes carefully
- **Risk 2**: NPM_TOKEN could be compromised if not handled securely
  - Mitigation: Use GitHub secrets, never log token values, rotate periodically
- **Risk 3**: CI optimizations might reduce reliability
  - Mitigation: Validate all tests pass, compare success rates before/after
- **Risk 4**: Codecov integration might fail intermittently
  - Mitigation: Already configured with `fail_ci_if_error: false` to prevent blocking

## Notes

- This is a maintenance/polish feature focused on improving developer experience
- All tasks are prioritized based on impact to development workflow
- Success depends on careful, incremental changes with validation at each step
- Documentation updates should reflect the improved CI/CD capabilities
