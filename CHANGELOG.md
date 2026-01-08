# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
