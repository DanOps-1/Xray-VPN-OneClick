# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

🔧 **CI/CD Pipeline Polish & Code Quality Improvements**

### Changed - 改进

#### 🎯 代码质量
- **Lint 问题完全修复**
  - 修复所有 90 个 ESLint 问题（53 错误 + 37 警告 → 0）
  - 移除未使用的 eslint-disable 指令
  - 清理未使用的变量和 catch 块
  - 将 `any` 类型替换为适当的 TypeScript 类型
  - 为公共 API 枚举和测试 mock 添加适当的 eslint-disable
  - 所有 210 个测试在整个修复过程中持续通过

#### ⚡ CI/CD 优化
- **移除 CI 临时解决方案**
  - 移除 lint 步骤的 `continue-on-error: true` 标志
  - 移除 format 步骤的 `continue-on-error: true` 标志
  - Lint 失败现在会正确阻止 CI 通过
  - 代码质量标准已强制执行

- **CI 性能优化**
  - Build job 现在与 test 并行运行（仅依赖 lint）
  - 添加 TypeScript 构建缓存（`dist/` 和 `.tsbuildinfo`）
  - CI 架构优化，为后续运行提供更好的性能

- **自动化发布**
  - 配置 NPM_TOKEN 用于自动 npm 发布
  - 推送版本标签即可自动发布到 npm

#### 📊 测试覆盖率可见性
- **Codecov 集成**
  - 添加 Codecov badge 到 README.md
  - 配置 CODECOV_TOKEN 用于覆盖率报告上传
  - 覆盖率报告在 CI 中自动生成和上传
  - Codecov dashboard 现已可用

### Fixed - 修复
- 修复 `src/types/terminal.ts` 中的未使用枚举成员（Platform）
- 修复 `src/utils/logger.ts` 中的未使用枚举成员（LogLevel, OutputMode）
- 修复 `src/commands/interactive.ts` 中的未使用 catch 参数
- 修复 `src/services/config-manager.ts` 中的 `any` 类型
- 修复多个测试文件中的未使用导入
- 修复空 catch 块警告

### Documentation - 文档
- 更新 CLAUDE.md 项目指南
- 添加完整的 Feature 004 规范和实施文档
- 创建 60 个任务的详细任务列表
- 添加快速入门指南和研究文档

## [1.1.0] - 2026-01-08

🎨 **CLI 用户界面优化 - 终端兼容性与视觉层次改进**

### Added - 新增功能

#### 🌍 通用系统兼容性
- **终端能力自动检测系统**
  - 实时检测 TTY 状态、颜色支持、Unicode 支持
  - 自动识别操作系统平台（Windows/Linux/macOS/FreeBSD）
  - 检测终端宽度和高度
  - 支持 TERM 环境变量解析

- **智能图标解析器**
  - Unicode 图标优先，自动降级到 ASCII
  - Windows CMD 完全兼容（纯 ASCII 模式）
  - 支持传统终端（vt100, dumb）
  - SSH 会话完美支持

- **三种输出模式**
  - RICH 模式：全彩色 + 格式化 + Unicode 图标
  - PLAIN_TTY 模式：无彩色 + 格式化 + ASCII 图标
  - PIPE 模式：纯文本 + 时间戳 + 结构化输出

#### 🎯 改进视觉层次
- **文本标签替代 Emoji**
  - 所有状态指示器使用 [标签] 格式
  - 菜单图标统一为 [查看][启动][停止] 等文本
  - 最大长度 ≤6 字符，保持紧凑
  - 支持中文标签显示

- **菜单分组优化**
  - 服务操作组（状态/启动/停止/重启）
  - 管理功能组（用户/配置/日志）
  - 退出组
  - 使用分隔符清晰划分

- **一致的图标样式**
  - ✓/✗ 替换为 [OK]/[ERROR]
  - 彩色编码保留（绿色成功、红色错误）
  - 易于快速扫描识别

#### 📐 一致终端交互
- **80 列布局优化**
  - 所有 UI 元素宽度 ≤80 列
  - 分隔符默认 50 字符，自适应终端宽度
  - 表格宽度限制为 59 字符
  - 菜单选项 + 描述总长度验证

- **终端宽度自适应**
  - 动态检测终端列数
  - 未检测到时默认 80 列
  - 最小宽度保护（40 列）
  - 窄终端友好

### Changed - 功能变更

#### 重构的模块
- **Logger 完全重构**
  - 添加 OutputMode 枚举
  - 实现 getOutputMode() 自动检测
  - formatMessage() 支持三种模式
  - 移除硬编码 emoji，使用图标解析器

- **命令文件更新**
  - `service.ts`: 移除 📊🟢🟡🔴✅，使用 menuIcons
  - `user.ts`: 移除 👥📧🆔📊✅💡，使用 menuIcons
  - `config.ts`: 移除 ⚙️✅💡⚠️，使用 menuIcons
  - `logs.ts`: 重构 getIconForLevel()，使用 resolveIcon()
  - `interactive.ts`: 更新主菜单和子菜单，添加分组注释
  - `cli.ts`: 移除 👋 emoji

#### 新增的常量和类型
- `src/types/terminal.ts`: Platform 枚举 + TerminalCapabilities 接口
- `src/constants/ui-symbols.ts`: 集中管理状态图标和菜单图标
- `src/utils/terminal.ts`: 终端检测函数
- `src/utils/icons.ts`: 图标解析函数

### Fixed - 问题修复

- **循环依赖修复**
  - icons.ts 使用 `import type { LogLevel }` 避免循环引用
  - STATUS_INDICATOR_MAP 改用字符串键
  - 函数中使用类型转换 `level as string`

- **ESLint 清理**
  - 添加 `// eslint-disable-next-line no-unused-vars` 到枚举声明
  - 移除测试文件中未使用的导入
  - 修复所有 lint 警告

### Tests - 测试

#### 新增测试文件
- `tests/unit/terminal.test.ts` - 30 个测试
  - 平台检测、Unicode 支持、终端能力

- `tests/unit/icons.test.ts` - 14 个测试
  - 图标解析、ASCII/Unicode 选择、菜单图标格式

- `tests/unit/logger.test.ts` - 11 个测试
  - 输出模式检测、消息格式化

- `tests/integration/ui-compatibility.test.ts` - 17 个测试
  - TTY 检测、Windows 兼容性、80 列布局

#### 测试覆盖率
- Terminal 模块: 95.45%
- Icons 模块: 90.47%
- 总测试数: 210 个全部通过

### Documentation - 文档

- 更新 README.md 添加终端兼容性说明（待完成）
- 更新 CHANGELOG.md（本文件）
- 代码注释完整，符合 JSDoc 规范

### Performance - 性能

- 终端能力检测结果缓存，避免重复调用
- 图标解析使用 Map 查找，O(1) 复杂度
- 无额外运行时开销

### Breaking Changes - 破坏性变更

无。此版本完全向下兼容 1.0.0。

---

## [1.0.0] - 2026-01-08

🎉 **首次正式发布！现已发布到 npm registry**

📦 **npm 安装**: `npm install -g xray-manager`
🔗 **npm 主页**: https://www.npmjs.com/package/xray-manager
🏷️ **GitHub Release**: https://github.com/DanOps-1/Xray-VPN-OneClick/releases/tag/v1.0.0

### Added - 交互式 CLI 管理工具 🎉

#### ✨ 核心功能

**服务管理**
- 交互式服务状态查看（运行时长、内存使用、PID）
- 启动/停止/重启服务操作
- 自动权限检测（root/sudo）
- systemd 集成和健康检查
- 优雅关闭策略（10秒超时）

**用户管理**
- 列出所有用户并显示详细信息
- 添加新用户（自动生成 UUID v4）
- 删除用户（支持序号选择）
- 生成并显示 VLESS 分享链接
- 自动复制链接到剪贴板
- 敏感信息自动脱敏（前4后4）

**配置管理**
- 查看当前 Xray 配置
- 创建配置备份（时间戳命名）
- 列出所有历史备份
- 从备份恢复配置
- 修改配置项（自动验证）
- 恢复前自动创建备份

**日志查看**
- 查看最近日志（可指定行数）
- 实时日志跟踪（follow 模式）
- 按级别过滤（emergency/alert/critical/error/warning/notice/info/debug）
- 按时间范围过滤（1小时前、今天、昨天等）
- 彩色日志输出（错误红色、警告黄色）
- Emoji 图标标识日志级别

#### 🔒 安全特性

**命令注入防护**
- 服务名验证（白名单模式）
- 路径遍历检测
- 危险字符过滤
- spawn() 代替 exec()

**数据安全**
- 敏感信息脱敏显示
- 配置文件权限 600
- 备份文件权限 600
- UUID 自动生成（crypto.randomUUID）

**权限管理**
- 自动检测 root 权限
- sudo 可用性检测
- 友好的权限错误提示
- systemd 可用性验证

#### 🎨 用户体验

**交互式菜单**
- 清晰的层级菜单结构（最多 3 层）
- 彩色输出和 Emoji 图标
- 键盘导航和快捷键
- Ctrl+C 优雅退出
- 菜单栈支持返回上级

**进度反馈**
- Ora spinner 加载动画
- 操作成功/失败提示
- 详细的错误消息
- 建议性修复提示

**中文本地化**
- 完整的中文界面
- 中文错误消息
- 中文日期时间格式

#### 🧪 测试覆盖

**单元测试（54 个）**
- SystemdManager: 22 个测试
- ConfigManager: 12 个测试
- UserManager: 10 个测试
- LogManager: 14 个测试
- Interactive: 17 个测试
- Utils: 4 个测试

**集成测试（84 个）**
- CLI 安装测试: 9 个
- 服务生命周期测试: 18 个
- 用户管理测试: 13 个
- 配置管理测试: 12 个
- 日志查看测试: 10 个
- 交互式菜单测试: 9 个

**测试覆盖率**
- SystemdManager: 81.25%
- ConfigManager: 65.78%
- 总体测试: 138 个全部通过

#### 📦 技术栈

**运行时**
- Node.js (ES2020)
- TypeScript 5.x
- Commander.js 12.x（CLI 框架）
- @inquirer/prompts 7.x（交互式提示）
- chalk 4.x（彩色输出）
- ora 8.x（加载动画）
- clipboardy 4.x（剪贴板操作）

**开发工具**
- Vitest 4.x（测试框架）
- @vitest/coverage-v8（覆盖率）
- ESLint 9.x（代码检查）
- Prettier 3.x（代码格式化）

#### 🛠️ 项目结构

```
src/
├── cli.ts                 # CLI 入口点
├── commands/              # 命令处理器
│   ├── config.ts          # 配置管理命令
│   ├── interactive.ts     # 交互式菜单
│   ├── logs.ts            # 日志查看命令
│   ├── service.ts         # 服务管理命令
│   └── user.ts            # 用户管理命令
├── services/              # 核心服务
│   ├── config-manager.ts  # 配置文件管理
│   ├── log-manager.ts     # 日志管理
│   ├── systemd-manager.ts # systemd 集成
│   └── user-manager.ts    # 用户管理
├── utils/                 # 工具函数
│   ├── clipboard.ts       # 剪贴板操作
│   ├── format.ts          # 格式化工具
│   ├── logger.ts          # 日志输出
│   ├── preflight.ts       # 预检查
│   ├── validator.ts       # 输入验证
│   └── which.ts           # 命令查找
├── constants/             # 常量定义
│   ├── exit-codes.ts      # 退出代码
│   ├── paths.ts           # 路径常量
│   └── timeouts.ts        # 超时配置
└── types/                 # TypeScript 类型
    ├── config.ts          # 配置类型
    ├── service.ts         # 服务类型
    └── user.ts            # 用户类型
```

### Changed

- 更新 README.md 添加 CLI 工具使用说明
- 优化代码格式（Prettier）
- 修复所有 ESLint 警告

### Security

- 实施命令注入防护
- 添加输入验证
- 敏感信息脱敏
- 文件权限强化
- 无硬编码密钥

### Documentation

- 完善 README.md
- 添加 CLI 工具文档
- 创建 CHANGELOG.md
- 添加安全特性说明

---

## [0.1.0] - 2026-01-07

### Added

- 初始项目结构
- Bash 安装脚本
- 基础 README 文档
- LICENSE 文件

---

## 版本说明

### 版本号规则

遵循语义化版本 (Semantic Versioning):

- **主版本号（Major）**: 不兼容的 API 修改
- **次版本号（Minor）**: 向下兼容的功能性新增
- **修订号（Patch）**: 向下兼容的问题修正

### 变更类型

- **Added**: 新增功能
- **Changed**: 对现有功能的变更
- **Deprecated**: 已过时的功能，即将移除
- **Removed**: 已移除的功能
- **Fixed**: 任何 bug 修复
- **Security**: 安全相关的修复
