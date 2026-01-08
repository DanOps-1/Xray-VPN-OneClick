# 📦 发布流程快速参考

## ✨ 一键发布（推荐）

```bash
# 1. 更新版本并编辑 CHANGELOG
npm version minor && vim CHANGELOG.md

# 2. 提交并创建 tag
git add . && git commit -m "chore: bump version to v$(node -p 'require(\"./package.json\").version')"
git push origin main

# 3. 推送 tag（触发自动发布）
git tag v$(node -p 'require("./package.json").version')
git push origin --tags
```

## 🔑 首次设置

需要在 GitHub 设置 NPM_TOKEN secret：

```bash
# 1. 创建 npm automation token
npm token create --type=automation

# 2. 在 GitHub 添加 secret
# Settings → Secrets and variables → Actions → New repository secret
# Name: NPM_TOKEN
# Value: <粘贴 token>
```

详细说明: [.github/workflows/SETUP.md](.github/workflows/SETUP.md)

## 📋 手动发布

如果需要手动控制：

```bash
# 构建
npm run build

# 发布到 npm
npm publish

# 创建 GitHub Release
gh release create v1.2.0 --notes "版本说明"
```

## 🤖 自动化工作流程

- **CI**: 每次推送/PR 自动运行测试
- **Release**: 推送 tag 自动发布到 npm 和 GitHub
- **Manual**: 在 Actions UI 手动触发发布

详细说明: [.github/workflows/README.md](.github/workflows/README.md)

## 🎯 版本号规范

- `major`: 破坏性变更 (1.0.0 → 2.0.0)
- `minor`: 新功能 (1.0.0 → 1.1.0)
- `patch`: bug 修复 (1.0.0 → 1.0.1)

## 📊 发布检查清单

- [ ] 所有测试通过 (`npm test`)
- [ ] 代码已格式化 (`npm run format`)
- [ ] CHANGELOG.md 已更新
- [ ] package.json 版本号已更新
- [ ] README.md 反映了新功能（如有）
- [ ] 提交到 main 分支
- [ ] 创建并推送 tag

## 🔗 快速链接

- npm 包: https://www.npmjs.com/package/xray-manager
- GitHub Releases: https://github.com/DanOps-1/Xray-VPN-OneClick/releases
- GitHub Actions: https://github.com/DanOps-1/Xray-VPN-OneClick/actions
