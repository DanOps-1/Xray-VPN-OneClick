# Quick Start Guide: CI/CD Pipeline Polish & Code Quality

**Feature**: 004-ci-polish
**Date**: 2026-01-08
**Purpose**: Implementation guides for CI/CD improvements and code quality fixes

## Prerequisites

- [x] npm account with publish permissions for `xray-manager` package
- [x] GitHub repository access with admin/maintainer permissions
- [x] Node.js 18+ installed locally for testing
- [x] All 210 tests currently passing

## Part 1: NPM Token Configuration (P1)

### Overview
Enable automated npm publishing by configuring NPM_TOKEN as a GitHub secret.

### Step 1: Create npm Automation Token

```bash
# 1. Login to npm (if not already logged in)
npm login

# 2. Create automation token
npm token create --type=automation

# Expected output:
# ┌────────────────┬──────────────────────────────────────┐
# │ token          │ npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   │
# ├────────────────┼──────────────────────────────────────┤
# │ cidr_whitelist │                                      │
# ├────────────────┼──────────────────────────────────────┤
# │ readonly       │ false                                │
# ├────────────────┼──────────────────────────────────────┤
# │ automation     │ true                                 │
# ├────────────────┼──────────────────────────────────────┤
# │ created        │ 2026-01-08T...                       │
# └────────────────┴──────────────────────────────────────┘

# ⚠️ IMPORTANT: Copy the token immediately - it won't be shown again!
```

### Step 2: Add Token to GitHub Secrets

1. Navigate to repository: https://github.com/DanOps-1/Xray-VPN-OneClick
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Fill in:
   - **Name**: `NPM_TOKEN`
   - **Secret**: Paste the token from Step 1 (starts with `npm_`)
5. Click **Add secret**

### Step 3: Verify Workflow Configuration

Check that `.github/workflows/release.yml` is configured correctly:

```yaml
- name: Publish to npm
  run: npm publish --provenance --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}  # ✅ Uses the secret
```

Status: ✅ Already configured correctly

### Step 4: Test the Setup

**Option A: Dry Run (Recommended)**

Test without actually publishing:

```bash
# 1. Create a test tag locally
git tag v1.1.1-test

# 2. Push to trigger workflow
git push origin v1.1.1-test

# 3. Check GitHub Actions:
# https://github.com/DanOps-1/Xray-VPN-OneClick/actions

# 4. Verify the workflow runs (it will fail at publish if version exists)

# 5. Clean up test tag
git tag -d v1.1.1-test
git push origin :refs/tags/v1.1.1-test
```

**Option B: Real Release**

If ready to publish a new version:

```bash
# Follow the documented release process in PUBLISHING.md
npm version patch  # or minor/major
# Update CHANGELOG.md
git commit -am "chore: bump version to vX.Y.Z"
git push origin main
git tag vX.Y.Z
git push origin vX.Y.Z

# Workflow automatically:
# ✅ Runs tests
# ✅ Builds project
# ✅ Publishes to npm
# ✅ Creates GitHub Release
```

### Security Best Practices

1. **Token Rotation**: Rotate token every 90 days
   ```bash
   # List current tokens
   npm token list

   # Revoke old token
   npm token revoke <token-id>

   # Create new token (repeat Step 1-2)
   npm token create --type=automation
   ```

2. **Audit Logs**: Monitor token usage
   ```bash
   # Check recent npm activity
   npm profile get
   ```

3. **Never Log Token**: GitHub Actions automatically masks secrets in logs

### Troubleshooting

**Error: 401 Unauthorized**
- Check NPM_TOKEN secret is set correctly
- Verify token hasn't expired: `npm token list`
- Ensure you have publish permissions: `npm access ls-packages`

**Error: 403 Forbidden**
- Check package name in `package.json` matches your npm package
- Verify you're logged in as the correct user: `npm whoami`

**Error: Version already published**
- Update version in `package.json`
- Ensure git tag matches package version

---

## Part 2: Lint Issue Resolution (P2)

### Overview
Fix 91 lint issues (57 errors + 34 warnings) in 3 incremental batches.

### Batch 1: Safe Auto-fixes (~20 issues)

**Target**: Unused imports and parameter naming

```bash
# 1. Run auto-fix
npm run lint -- --fix

# 2. Review changes
git diff

# 3. Test everything still works
npm test

# Expected: Some unused imports removed, formatting fixed
```

**Manual fixes** (if auto-fix doesn't handle):

Unused parameters - prefix with underscore:
```typescript
// Before:
function handler(req, res, next) {  // 'next' is never used
  return res.json({});
}

// After:
function handler(req, res, _next) {  // Prefix unused with _
  return res.json({});
}
```

**Commit**: `fix(lint): remove unused imports and fix parameter names`

### Batch 2: Enum and Variable Cleanup (~40 issues)

**Target**: Unused enum members and variables

#### Unused Enum Members

Files affected:
- `src/types/terminal.ts` - Platform enum
- `src/utils/logger.ts` - LogLevel and OutputMode enums

**Strategy**: These are exported enums (public API). Options:

1. **If used elsewhere**: Already fine, ESLint false positive
2. **If part of public API**: Add eslint-disable (already done)
3. **If truly unused**: Remove the unused members

Example (already applied):
```typescript
// Keep the disable comment for public API enums
// eslint-disable-next-line no-unused-vars
export enum Platform {
  WIN32 = 'win32',
  LINUX = 'linux',
  // ...
}
```

#### Unused Variables

Files affected:
- `src/commands/interactive.ts` - unused 'error' variable
- `src/services/log-manager.ts` - unused 'entry' parameter
- `src/utils/clipboard.ts` - unused '_error' variables
- `tests/` - various unused imports

**Strategy**:

1. If variable is for future use: Add `// @ts-ignore` or `eslint-disable-next-line`
2. If genuinely unused: Remove it
3. If it's a catch parameter: Prefix with `_`

```typescript
// Before:
try {
  copyToClipboard(text);
} catch (error) {  // error is never used
  return false;
}

// After (if not logging error):
try {
  copyToClipboard(text);
} catch (_error) {  // Prefix with _ to indicate intentional
  return false;
}
```

**Commands**:
```bash
# Fix files one by one, test after each
npm run lint src/commands/interactive.ts
# Make fixes
npm test

npm run lint src/services/log-manager.ts
# Make fixes
npm test

# Continue for each file...
```

**Commit**: `fix(lint): remove unused variables and clean up catch blocks`

### Batch 3: Type Safety (~31 issues)

**Target**: Replace `any` types with proper TypeScript types

Files affected:
- `src/services/config-manager.ts` - 2 warnings
- `tests/unit/commands/interactive.test.ts` - 4 warnings
- `tests/unit/services/systemd-manager.test.ts` - 10 warnings
- `tests/integration/service-lifecycle.test.ts` - 2 warnings
- `tests/integration/user-management.test.ts` - 2 warnings
- Others...

**Strategy**:

1. **For test mocks**: Use `jest.Mock` or specific mock types
2. **For dynamic objects**: Create proper interfaces
3. **For external libraries**: Use `@types/` packages or declare types

```typescript
// Before:
const mockConfig: any = { host: 'localhost' };

// After:
interface MockConfig {
  host: string;
  port?: number;
}
const mockConfig: MockConfig = { host: 'localhost' };
```

```typescript
// Before:
vi.spyOn(obj, 'method').mockReturnValue({} as any);

// After:
vi.spyOn(obj, 'method').mockReturnValue({
  status: 'success',
  data: []
} as MethodReturnType);
```

**Commands**:
```bash
# Fix one file at a time, test after each
npm run lint src/services/config-manager.ts
# Add proper types
npm test

# Continue for each file...
```

**Commit**: `fix(lint): replace any types with proper TypeScript types`

### Final Step: Remove CI Workarounds

After all lint issues are fixed:

```bash
# Verify lint passes
npm run lint
# Expected: ✨ 0 problems (0 errors, 0 warnings)

# Remove continue-on-error from CI
git diff .github/workflows/ci.yml
```

Edit `.github/workflows/ci.yml`:
```yaml
- name: Run ESLint
  run: npm run lint
  # Remove this line: continue-on-error: true

- name: Check code formatting
  run: npm run format -- --check
  # Remove this line: continue-on-error: true
```

**Commit**: `ci: remove lint workarounds after fixing all issues`

---

## Part 3: Add Codecov Badge (P3)

### Overview
Add coverage badge to README for transparency.

### Step 1: Get Codecov Badge URL

The badge URL format:
```
https://codecov.io/gh/DanOps-1/Xray-VPN-OneClick/branch/main/graph/badge.svg
```

### Step 2: Add Badge to README

Edit `README.md`, add badge to the top section (after existing badges):

```markdown
# Xray VPN OneClick

[![npm version](https://img.shields.io/npm/v/xray-manager.svg)](https://www.npmjs.com/package/xray-manager)
[![CI](https://github.com/DanOps-1/Xray-VPN-OneClick/actions/workflows/ci.yml/badge.svg)](https://github.com/DanOps-1/Xray-VPN-OneClick/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/DanOps-1/Xray-VPN-OneClick/branch/main/graph/badge.svg)](https://codecov.io/gh/DanOps-1/Xray-VPN-OneClick)
```

### Step 3: Verify Badge

1. Commit and push changes
2. View README on GitHub
3. Click badge to verify it links to Codecov dashboard

**Commit**: `docs: add Codecov coverage badge to README`

---

## Part 4: Optimize CI Performance (P4)

### Overview
Reduce CI run time by ~20% through build optimization and dependency removal.

### Optimization 1: Remove Build Dependency on Tests

**Current**:
```yaml
build:
  needs: [lint, test]  # Waits for all tests to complete
```

**Optimized**:
```yaml
build:
  needs: [lint]  # Only waits for lint
```

**Rationale**: Build doesn't need test results, can run in parallel

Edit `.github/workflows/ci.yml`:
```yaml
build:
  name: Build Project
  runs-on: ubuntu-latest
  needs: [lint]  # Remove test dependency
  steps:
    # ... rest unchanged
```

### Optimization 2: Cache TypeScript Build

Add caching for `dist/` and `.tsbuildinfo`:

```yaml
build:
  name: Build Project
  runs-on: ubuntu-latest
  needs: [lint]
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Cache TypeScript build
      uses: actions/cache@v4
      with:
        path: |
          dist/
          .tsbuildinfo
        key: build-${{ runner.os }}-${{ hashFiles('src/**/*.ts', 'tsconfig.json') }}
        restore-keys: |
          build-${{ runner.os }}-

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build TypeScript
      run: npm run build

    # ... rest unchanged
```

### Step 3: Test Optimizations

```bash
# 1. Push changes to feature branch
git checkout 004-ci-polish
git add .github/workflows/ci.yml
git commit -m "ci: optimize build process"
git push origin 004-ci-polish

# 2. Create test PR to trigger CI
gh pr create --title "CI Optimization Test"

# 3. Monitor CI run times:
# Before: ~60-80s total, build ~13s
# After: ~48-64s total, build ~8-10s (with cache)

# 4. Verify all jobs pass
# ✅ Lint
# ✅ Test (18, 20, 22)
# ✅ Build
```

### Expected Results

| Job | Before | After | Improvement |
|-----|--------|-------|-------------|
| Lint | 13-19s | 13-19s | 0% (no change) |
| Test (each) | 16-20s | 16-20s | 0% (no change) |
| Build | 13s | 8-10s | ~25% |
| **Total pipeline** | 60-80s | 48-64s | **20-25%** |

**Note**: Build can now start immediately after lint (~10s savings from parallelization)

**Commit**: `ci: optimize build caching and parallelization`

---

## Validation Checklist

After completing all parts:

- [ ] **P1**: NPM_TOKEN configured, automated publish works
- [ ] **P2**: `npm run lint` returns 0 errors, 0 warnings
- [ ] **P2**: CI lint step passes without `continue-on-error`
- [ ] **P3**: Codecov badge visible in README
- [ ] **P4**: CI run time reduced by ≥20%
- [ ] **All**: All 210 tests still pass
- [ ] **All**: No regressions introduced

## Next Steps

1. Run `/speckit.tasks` to generate detailed task list
2. Follow tasks in priority order (P1 → P2 → P3 → P4)
3. Test incrementally after each change
4. Create PR when complete

## Support

- Lint issues: Run `npm run lint -- --help`
- CI debugging: Check GitHub Actions logs
- npm problems: https://docs.npmjs.com/
- Codecov: https://docs.codecov.com/
