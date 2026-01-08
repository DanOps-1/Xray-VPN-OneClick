# 🚀 设置 NPM_TOKEN 以启用自动发布

为了让 GitHub Actions 能够自动发布包到 npm，你需要在 GitHub 仓库中设置 `NPM_TOKEN` secret。

## 📝 快速设置步骤

### 1. 创建 npm Automation Token

```bash
# 登录 npm（如果还没登录）
npm login

# 创建 automation token
npm token create --type=automation
```

输出示例：
```
┌────────────────┬──────────────────────────────────────┐
│ token          │ npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   │
├────────────────┼──────────────────────────────────────┤
│ cidr_whitelist │                                      │
├────────────────┼──────────────────────────────────────┤
│ readonly       │ false                                │
├────────────────┼──────────────────────────────────────┤
│ automation     │ true                                 │
├────────────────┼──────────────────────────────────────┤
│ created        │ 2026-01-08T10:30:45.123Z             │
└────────────────┴──────────────────────────────────────┘
```

⚠️ **重要**: 立即复制这个 token，它只会显示一次！

### 2. 在 GitHub 添加 Secret

1. 前往你的 GitHub 仓库
2. 点击 **Settings** (设置)
3. 左侧菜单选择 **Secrets and variables** → **Actions**
4. 点击 **New repository secret** 按钮
5. 填写信息：
   - **Name**: `NPM_TOKEN`
   - **Secret**: 粘贴刚才复制的 token (格式: `npm_xxxx...`)
6. 点击 **Add secret**

### 3. 验证设置

创建一个测试 tag 来验证自动发布是否工作：

```bash
# 创建测试 tag（不会真正发布，因为版本号相同）
git tag v1.1.0-test
git push origin v1.1.0-test

# 查看 Actions 运行结果
# 前往: https://github.com/DanOps-1/Xray-VPN-OneClick/actions

# 验证后删除测试 tag
git tag -d v1.1.0-test
git push origin :refs/tags/v1.1.0-test
```

## ✅ 完成！现在可以自动发布了

以后每次发布新版本，只需要：

```bash
# 1. 更新版本号
npm version minor  # 或 major / patch

# 2. 更新 CHANGELOG.md
# 手动编辑 CHANGELOG.md，添加新版本说明

# 3. 提交更改
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to vX.Y.Z"
git push origin main

# 4. 创建并推送 tag（触发自动发布）
git tag vX.Y.Z
git push origin vX.Y.Z
```

GitHub Actions 会自动：
- ✅ 运行完整测试
- ✅ 构建项目
- ✅ 发布到 npm
- ✅ 创建 GitHub Release

## 🔒 安全建议

### Token 类型选择

- ✅ **推荐**: Automation token (自动化令牌)
  - 专为 CI/CD 设计
  - 无法用于修改账户设置
  - 更安全

- ❌ **不推荐**: Publish token (发布令牌) 或 Classic token
  - 权限过大
  - 安全风险较高

### Token 管理

定期轮换 token：

```bash
# 1. 撤销旧 token
npm token revoke <token-id>

# 2. 创建新 token
npm token create --type=automation

# 3. 更新 GitHub Secret
# 前往 Settings → Secrets and variables → Actions
# 点击 NPM_TOKEN → Update
```

查看所有 tokens：
```bash
npm token list
```

### CIDR 白名单（可选）

如果你的 CI/CD 服务器有固定 IP，可以限制 token 只能从特定 IP 使用：

```bash
npm token create --type=automation --cidr=<your-ip-range>
```

## 📚 其他可选 Secrets

### CODECOV_TOKEN（测试覆盖率）

如果想启用测试覆盖率追踪：

1. 前往 https://codecov.io/
2. 使用 GitHub 登录
3. 添加你的仓库
4. 复制 token
5. 在 GitHub 添加 `CODECOV_TOKEN` secret

## 🔍 故障排查

### npm 发布失败

**错误**: `401 Unauthorized`
- 检查 NPM_TOKEN 是否正确设置
- 确认 token 类型是 `automation`
- 验证 token 未过期: `npm token list`

**错误**: `403 Forbidden`
- 确认你的 npm 账号有发布权限
- 检查包名是否已被其他人占用
- 确认 `package.json` 中的 `name` 字段正确

**错误**: `You cannot publish over the previously published versions`
- 版本号冲突，需要更新 `package.json` 中的版本号
- 确保 git tag 和 package.json 版本一致

### GitHub Actions 失败

查看详细日志：
1. 前往 Actions 标签页
2. 点击失败的 workflow
3. 查看具体步骤的错误信息

## 📖 相关文档

- [GitHub Actions Workflows 说明](./.github/workflows/README.md)
- [npm Token 文档](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [GitHub Secrets 文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 💡 最佳实践

1. **保护 main 分支**
   - Settings → Branches → Add rule
   - 要求 PR 审查后才能合并
   - 要求 CI 通过后才能合并

2. **使用 protected tags**
   - 防止意外删除或覆盖版本 tag
   - Settings → Tags → Add rule: `v*`

3. **版本号语义化**
   - Major: 破坏性变更
   - Minor: 新功能（向下兼容）
   - Patch: bug 修复

4. **保持 CHANGELOG 更新**
   - 每个版本都应有详细的变更说明
   - 遵循 Keep a Changelog 格式

## ❓ 需要帮助？

如果设置过程中遇到问题：

1. 查看 [.github/workflows/README.md](./README.md)
2. 查看 [GitHub Discussions](https://github.com/DanOps-1/Xray-VPN-OneClick/discussions)
3. 提交 [Issue](https://github.com/DanOps-1/Xray-VPN-OneClick/issues)
