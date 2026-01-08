# Data Model: CLI User Interface Optimization

**Feature**: 003-cli-ui-optimization
**Date**: 2026-01-08
**Purpose**: 定义 UI 优化功能所需的核心数据结构和类型

---

## 1. 终端能力 (TerminalCapabilities)

### 描述
表示当前终端的能力和特性，用于自适应输出格式。

### 字段

| 字段名 | 类型 | 描述 | 验证规则 |
|--------|------|------|---------|
| `isTTY` | `boolean` | 是否为交互式终端 | 必填，从 `process.stdout.isTTY` 读取 |
| `supportsColor` | `boolean` | 是否支持颜色输出 | 必填，从 chalk.level 判断 |
| `supportsUnicode` | `boolean` | 是否支持 Unicode 字符 | 必填，根据 TERM 和平台判断 |
| `width` | `number` | 终端宽度（列数） | 必填，最小值 40，默认 80 |
| `height` | `number` | 终端高度（行数） | 可选，默认 24 |
| `platform` | `Platform` | 操作系统平台 | 必填，枚举值 |
| `term` | `string` | TERM 环境变量值 | 可选，如 'xterm-256color' |

### 状态转换
无状态转换（只读配置）

### 关系
- 被 `OutputFormatter` 使用
- 被 `IconResolver` 使用

---

## 2. 输出模式 (OutputMode)

### 描述
表示 logger 的输出模式，根据终端能力自动选择。

### 枚举值

| 值 | 描述 | 使用场景 |
|----|------|---------|
| `RICH` | 完整模式（颜色+格式） | 交互式终端，支持颜色 |
| `PLAIN_TTY` | 朴素模式（无颜色） | 交互式终端，`--no-color` 标志 |
| `PIPE` | 管道模式（纯文本） | 非交互式输出（管道/重定向） |

### 状态转换
```
RICH <--(--no-color)--> PLAIN_TTY
RICH/PLAIN_TTY <--(pipe检测)--> PIPE
```

---

## 3. 状态指示符 (StatusIndicator)

### 描述
表示不同状态的视觉指示符，包含 Unicode 和 ASCII 两种表示。

### 字段

| 字段名 | 类型 | 描述 | 验证规则 |
|--------|------|------|---------|
| `level` | `LogLevel` | 日志级别 | 必填，枚举值 |
| `unicode` | `string` | Unicode 符号 | 必填，单字符 |
| `ascii` | `string` | ASCII 备选方案 | 必填，`[LABEL]` 格式 |
| `color` | `ChalkColor` | 关联颜色 | 必填，chalk 颜色函数 |

### 预定义实例

| Level | Unicode | ASCII | Color |
|-------|---------|-------|-------|
| `SUCCESS` | `✓` (U+2713) | `[OK]` | green |
| `ERROR` | `✗` (U+2717) | `[ERROR]` | red |
| `WARN` | `!` (U+0021) | `[WARN]` | yellow |
| `INFO` | `i` (U+0069) | `[INFO]` | cyan |
| `DEBUG` | `·` (U+00B7) | `[DEBUG]` | gray |
| `LOADING` | `...` | `[...]` | cyan |
| `PROGRESS` | `>` (U+003E) | `[>>]` | blue |
| `HINT` | `*` (U+002A) | `[TIP]` | cyan |

### 验证规则
- `unicode` 必须是 BMP 范围内的字符（U+0000 - U+FFFF）
- `ascii` 必须是 7-bit ASCII 可打印字符
- `ascii` 长度 ≤ 8 字符（适配 80 列宽度）

---

## 4. 菜单选项 (MenuOption)

### 描述
表示交互式菜单中的一个选项，包含显示文本和图标。

### 字段

| 字段名 | 类型 | 描述 | 验证规则 |
|--------|------|------|---------|
| `name` | `string` | 显示名称 | 必填，最大 60 字符 |
| `value` | `string` | 选项值 | 必填，唯一标识符 |
| `icon` | `MenuIcon` | 菜单图标 | 可选 |
| `description` | `string` | 详细描述 | 可选，最大 100 字符 |
| `disabled` | `boolean` | 是否禁用 | 可选，默认 false |

### 关系
- 包含 `MenuIcon`
- 被 `InteractiveMenu` 使用

---

## 5. 菜单图标 (MenuIcon)

### 描述
表示菜单选项的图标，提供 emoji 和文本两种表示。

### 字段

| 字段名 | 类型 | 描述 | 验证规则 |
|--------|------|------|---------|
| `emoji` | `string` | 原始 emoji（已弃用） | 可选，仅用于迁移对比 |
| `text` | `string` | 文本替代方案 | 必填，`[标签]` 格式 |

### 预定义实例

| 功能 | 原 Emoji | 新文本 |
|------|----------|--------|
| 查看状态 | 📊 | `[查看]` |
| 启动服务 | 🚀 | `[启动]` |
| 停止服务 | 🛑 | `[停止]` |
| 重启服务 | 🔄 | `[重启]` |
| 用户管理 | 👥 | `[用户]` |
| 配置管理 | ⚙️ | `[配置]` |
| 查看日志 | 📝 | `[日志]` |
| 退出程序 | ❌ | `[退出]` |

### 验证规则
- `text` 必须是 `[...]` 格式
- `text` 长度 ≤ 6 字符（包括括号）
- `text` 仅包含中文或英文字母

---

## 6. 格式化选项 (FormatterOptions)

### 描述
控制 logger 输出格式的配置选项。

### 字段

| 字段名 | 类型 | 描述 | 验证规则 |
|--------|------|------|---------|
| `color` | `boolean` | 启用颜色输出 | 必填，默认 true |
| `timestamp` | `boolean` | 显示时间戳 | 可选，默认 false |
| `level` | `LogLevel` | 最小日志级别 | 可选，默认 INFO |
| `mode` | `OutputMode` | 输出模式 | 可选，自动检测 |
| `maxWidth` | `number` | 最大输出宽度 | 可选，默认 80 |

### 验证规则
- `maxWidth` 范围：40 - 200
- `level` 必须是有效的 LogLevel 枚举值

---

## 7. 平台枚举 (Platform)

### 描述
操作系统平台枚举。

### 枚举值

| 值 | 描述 |
|----|------|
| `WIN32` | Windows (所有版本) |
| `LINUX` | Linux (所有发行版) |
| `DARWIN` | macOS |
| `FREEBSD` | FreeBSD |
| `OTHER` | 其他未知平台 |

### 映射关系
从 `process.platform` 映射：
- `'win32'` → `WIN32`
- `'linux'` → `LINUX`
- `'darwin'` → `DARWIN`
- `'freebsd'` → `FREEBSD`
- 其他 → `OTHER`

---

## 8. 日志级别 (LogLevel)

### 描述
日志消息的严重程度级别（已存在，此处扩展）。

### 枚举值

| 值 | 优先级 | 描述 |
|----|--------|------|
| `DEBUG` | 0 | 调试信息 |
| `INFO` | 1 | 一般信息 |
| `SUCCESS` | 2 | 成功状态 |
| `WARN` | 3 | 警告信息 |
| `ERROR` | 4 | 错误信息 |

### 关系
- 被 `StatusIndicator` 使用
- 被 `FormatterOptions` 使用

---

## 实体关系图

```
TerminalCapabilities ──< OutputFormatter
        │
        └──< IconResolver ──< StatusIndicator
                    │
                    └──< MenuIcon

FormatterOptions ──< Logger
        │
        └──< OutputMode

MenuOption ──< MenuIcon
    │
    └──< InteractiveMenu
```

---

## 数据流

1. **启动时**：
   ```
   检测终端能力 → 创建 TerminalCapabilities
   → 确定 OutputMode → 配置 Logger
   ```

2. **日志输出时**：
   ```
   Logger.info(message)
   → IconResolver.resolve(LogLevel, TerminalCapabilities)
   → 选择 StatusIndicator (unicode/ascii)
   → OutputFormatter.format(message, indicator, mode)
   → 输出到 stdout
   ```

3. **菜单显示时**：
   ```
   InteractiveMenu.show(options)
   → 遍历 MenuOption[]
   → 替换 MenuIcon (emoji → text)
   → Inquirer.select() 显示菜单
   ```

---

## 向后兼容性

### 保留的接口
- `logger.info()`, `logger.error()` 等方法签名不变
- `logger.configure()` 保持兼容
- 现有颜色配置 (`--no-color`) 继续有效

### 迁移路径
- 旧代码无需修改即可使用新文本指示符
- Emoji 显示自动替换为文本，对调用方透明

---

## 性能考量

### 缓存策略
- `TerminalCapabilities` 在启动时检测一次，全局缓存
- `StatusIndicator` 映射表使用对象字典（O(1) 查找）
- `IconResolver` 结果不缓存（开销极小）

### 内存占用
- 新增类型和常量 ~5KB
- 运行时对象 ~1KB
- 总增量可忽略不计
