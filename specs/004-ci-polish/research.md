# Research Document: CI/CD Pipeline Polish & Code Quality

**Feature**: 004-ci-polish
**Date**: 2026-01-08
**Purpose**: Document research findings for implementing CI/CD improvements and code quality fixes

## R1: NPM Token Configuration

### Question
Best practices for storing and rotating npm automation tokens for use in GitHub Actions

### Findings

#### Token Types
- **Granular Access Token** (recommended): Fine-grained permissions, can be scoped to specific packages
- **Classic Token**: Legacy, broader permissions
- **Automation Token**: Specifically designed for CI/CD (no 2FA required)

#### Best Practices

**Creation**:
```bash
npm token create --type=automation
```

**Storage**:
- Store as GitHub encrypted secret (`NPM_TOKEN`)
- Never commit to repository or log in CI output
- Use in workflows via `${{ secrets.NPM_TOKEN }}`

**Security**:
- Rotate tokens every 90 days
- Use audit logs to monitor token usage
- Revoke immediately if compromised
- Limit token scope to specific packages when possible

**Verification**:
```bash
npm whoami --registry https://registry.npmjs.org
npm token list
```

#### Implementation Decision

**Decision**: Use npm automation token stored as GitHub secret

**Rationale**:
- Automation tokens don't require 2FA, suitable for CI/CD
- GitHub secrets are encrypted and only accessible to authorized workflows
- Already supported in existing `.github/workflows/release.yml`

**Configuration Steps**:
1. Create automation token: `npm token create --type=automation`
2. Add to GitHub: Repository Settings → Secrets → New secret `NPM_TOKEN`
3. Verify workflow uses `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`

**Documentation Reference**: Already documented in `.github/workflows/SETUP.md`

---

## R2: ESLint Auto-fix Safety

### Question
Which of the 91 lint issues can be safely auto-fixed vs requiring manual review?

### Current Lint Issues Breakdown

**Total**: 91 issues (57 errors, 34 warnings)

#### Error Categories (57 errors):

1. **Unused Variables** (31 errors):
   - Pattern: `'variable' is defined but never used`
   - Files affected: `src/types/terminal.ts`, `src/utils/logger.ts`, `src/commands/interactive.ts`, etc.
   - Auto-fix: NO - requires code review to determine if variable is needed

2. **Unused Function Parameters** (8 errors):
   - Pattern: `'param' is defined but never used. Allowed unused args must match /^_/u`
   - Files affected: `src/services/log-manager.ts`, `src/utils/validator.ts`, etc.
   - Auto-fix: YES - prefix with underscore `_param` if intentionally unused

3. **Unused Imports** (14 errors):
   - Pattern: `'import' is defined but never used`
   - Files affected: Multiple test files
   - Auto-fix: YES - ESLint can automatically remove

4. **Empty Block Statements** (2 errors):
   - Pattern: `Empty block statement`
   - Files affected: `tests/unit/services/config-manager.test.ts`
   - Auto-fix: NO - requires code review (might be TODO or intentional)

5. **No-undef** (2 errors):
   - Pattern: `'variable' is not defined`
   - Files affected: `tests/unit/services/user-manager.test.ts` (crypto)
   - Auto-fix: NO - requires adding proper imports

#### Warning Categories (34 warnings):

1. **Unexpected any** (34 warnings):
   - Pattern: `Unexpected any. Specify a different type`
   - Files affected: Multiple test files, some service files
   - Auto-fix: NO - requires proper TypeScript typing

#### Auto-fix Safety Analysis

**Safe to auto-fix** (estimated 20-30% of issues):
- Unused imports in test files
- Unused parameters that can be prefixed with `_`
- Some formatting issues (if any)

**Requires manual review** (70-80% of issues):
- Enum members marked unused (might be part of public API)
- Unused variables (need to determine if dead code or oversight)
- Empty blocks (might be intentional or TODOs)
- Missing type annotations (`any` types)
- Undefined variables (missing imports)

### Implementation Decision

**Decision**: Fix lint issues in 3 batches, testing after each

**Batch 1 - Safe Auto-fixes** (~20 issues):
- Run `npm run lint -- --fix`
- Remove auto-removed unused imports
- Prefix intentionally unused parameters with `_`
- Test: `npm test`

**Batch 2 - Enum and Variable Cleanup** (~40 issues):
- Fix unused enum members (add `// eslint-disable-next-line` if part of public API, or convert to const if truly unused)
- Remove genuinely unused variables
- Add missing imports
- Test: `npm test`

**Batch 3 - Type Safety** (~31 issues):
- Replace `any` types with proper TypeScript types
- Fix empty blocks (add comments or implement)
- Test: `npm test` + manual code review

**Rationale**:
- Incremental approach reduces risk of introducing bugs
- Running tests after each batch provides safety net
- Most risky changes (type annotations) done last with careful review

---

## R3: CI Optimization Opportunities

### Question
What CI optimizations are available without sacrificing correctness?

### Current CI Performance

**Baseline** (from recent runs):
- Lint job: ~13-19 seconds
- Test jobs (each): ~16-20 seconds per Node.js version
- Build job: ~13 seconds
- Total pipeline: ~60-80 seconds (jobs run in parallel)

### Analysis

#### Current Workflow Structure
```yaml
ci.yml:
  - Lint (Node 18)
  - Test (Node 18, 20, 22) - matrix
  - Build (depends on lint+test)
```

#### Optimization Opportunities

**1. Dependency Caching** (Expected: -30% install time):
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'  # ✅ Already implemented
```
Status: ✅ Already optimized

**2. Build Artifacts Caching** (Expected: -50% build time):
```yaml
- uses: actions/cache@v4
  with:
    path: dist/
    key: build-${{ github.sha }}
```
Status: ⚠️ Opportunity - cache dist/ between jobs

**3. Parallel Job Optimization**:
- Current: Build job depends on lint+test completing
- Opportunity: Build can run in parallel with tests (doesn't need test results)
Status: ⚠️ Can remove dependency

**4. Test Coverage Optimization**:
- Current: Coverage generated on Node 20 and 22 (Node 18 skipped)
- Opportunity: Only generate coverage once (Node 20)
Status: ✅ Already optimized

**5. Lint Parallelization**:
- Current: Lint and format run sequentially
- Opportunity: Split into two parallel jobs if needed
Status: ℹ️ Low impact (lint is fast)

**6. npm ci vs npm install**:
- Current: Uses `npm ci` (clean install)
- Status: ✅ Already optimized

### Implementation Decision

**Decision**: Implement 2 optimizations for ~20-25% improvement

**Optimization 1 - Remove Build Dependency**:
```yaml
build:
  needs: [lint]  # Remove test dependency
```
Expected impact: Build can start immediately after lint (~10s savings)

**Optimization 2 - Cache TypeScript Build**:
```yaml
- uses: actions/cache@v4
  with:
    path: |
      dist/
      .tsbuildinfo
    key: build-${{ hashFiles('src/**/*.ts') }}
```
Expected impact: Skip rebuild if source unchanged (~5-7s savings)

**Rationale**:
- Low risk changes
- Measurable impact
- No effect on test coverage or correctness
- Achieves 20% improvement target

**Not Implementing**:
- Splitting lint job: Low impact, adds complexity
- Removing test jobs: Need multi-version testing
- Aggressive caching: Risk of stale builds

---

## Summary

### Key Decisions

1. **NPM Token**: Use automation token via GitHub secrets (already documented)
2. **Lint Fixes**: 3-batch incremental approach with testing
3. **CI Optimization**: Remove build dependency + cache TypeScript artifacts

### Risk Assessment

| Decision | Risk Level | Mitigation |
|----------|-----------|------------|
| NPM Token Setup | Low | Use automation token, follow security best practices |
| Lint Batch 1 (Auto-fix) | Low | Run full test suite after changes |
| Lint Batch 2 (Variables) | Medium | Careful review, test after each file |
| Lint Batch 3 (Types) | High | Manual review, comprehensive testing |
| CI Build Dependency | Low | Build doesn't depend on test results |
| CI Caching | Medium | Use content-based keys, test thoroughly |

### Expected Outcomes

- **NPM Publishing**: Fully automated on tag push
- **Code Quality**: 0 lint errors/warnings
- **CI Performance**: 20-25% faster
- **Test Safety**: All 210 tests continue passing

### Documentation Updates Needed

- [ ] README: Add Codecov badge
- [ ] CLAUDE.md: Update with ESLint configuration details
- [ ] CI workflows: Add comments explaining optimizations

---

## References

- npm Token Documentation: https://docs.npmjs.com/creating-and-viewing-access-tokens
- GitHub Actions Caching: https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows
- ESLint Rules: https://eslint.org/docs/latest/rules/
- Existing Setup Guide: `.github/workflows/SETUP.md`
