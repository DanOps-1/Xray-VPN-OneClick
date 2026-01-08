# Research Document: CLI User Interface Optimization

**Feature**: 003-cli-ui-optimization
**Date**: 2026-01-08
**Purpose**: 研究终端兼容性、文本指示符最佳实践和测试策略

## 研究任务概览

本文档记录了 CLI UI 优化功能所需的技术研究结果，包括：
1. 终端能力检测机制
2. 跨平台兼容的文本指示符设计
3. TTY 检测和输出适配
4. 测试策略（不同终端环境）

---

## 1. 终端能力检测机制

### 决策：使用 Node.js 内置 TTY 模块 + 环境变量检测

**研究结果**：
- Node.js 提供 `process.stdout.isTTY` 和 `process.stderr.isTTY` 来检测是否为交互式终端
- 通过 `process.env.TERM` 可以判断终端类型（如 `dumb`, `xterm`, `xterm-256color`）
- Windows CMD 和 PowerShell 可通过 `process.platform === 'win32'` 识别
- Chalk 库已内置颜色支持检测（`chalk.level` 属性）

**理由**：
- 无需引入额外依赖
- Node.js TTY 模块是标准化的跨平台解决方案
- 与现有 chalk 库集成良好
- 性能开销极小（仅环境变量读取）

**替代方案考虑**：
- ✗ **supports-color** 库：功能重复，chalk 已包含类似检测
- ✗ **terminal-kit** 库：过于复杂，引入大量不需要的功能
- ✗ **手动编码检测**：维护成本高，容易出错

**实现要点**：
```typescript
// 检测终端能力
interface TerminalCapabilities {
  isTTY: boolean;           // 是否交互式终端
  supportsColor: boolean;   // 是否支持颜色
  supportsUnicode: boolean; // 是否支持 Unicode
  width: number;            // 终端宽度
  platform: string;         // 操作系统平台
}

// 检测逻辑
- isTTY: process.stdout.isTTY
- supportsColor: chalk.level > 0
- supportsUnicode: process.env.TERM !== 'dumb' && platform !== 'win32' (Windows CMD 默认不支持)
- width: process.stdout.columns || 80
- platform: process.platform
```

---

## 2. 跨平台兼容的文本指示符设计

### 决策：分层策略 - Unicode 优先，ASCII 降级

**研究结果**：
对比了三种方案的兼容性：

| 指示符类型 | Linux/macOS | Windows PowerShell | Windows CMD | SSH最小终端 |
|-----------|------------|-------------------|-------------|-----------|
| Emoji (当前) | ✅ | ⚠️ 部分支持 | ❌ 显示框 | ❌ 显示框 |
| Unicode 符号 | ✅ | ✅ | ⚠️ 部分支持 | ⚠️ 部分支持 |
| ASCII 符号 | ✅ | ✅ | ✅ | ✅ |

**决策：分层降级策略**
1. **基础 Unicode 符号**（U+2713, U+2717 等）：适用于大多数现代终端
2. **ASCII 括号标记**（`[OK]`, `[ERROR]`）：完全兼容所有终端

**指示符映射表**：

| 状态 | 当前 Emoji | Unicode 符号 | ASCII 备选 | 使用场景 |
|------|-----------|-------------|-----------|---------|
| Success | ✅ | ✓ (U+2713) | [OK] | 所有成功状态 |
| Error | ❌ | ✗ (U+2717) | [ERROR] | 所有错误状态 |
| Warning | ⚠️ | ! (U+0021) | [WARN] | 警告信息 |
| Info | ℹ️ | i (U+0069) | [INFO] | 一般信息 |
| Loading | ⏳ | ... | [...] | 加载状态 |
| Progress | 🔄 | > (U+003E) | [>>] | 进度指示 |
| Hint | 💡 | * (U+002A) | [TIP] | 提示信息 |

**菜单图标映射**：

| 功能 | 当前 Emoji | 文本替代 |
|------|-----------|---------|
| 查看状态 | 📊 | [查看] |
| 启动服务 | 🚀 | [启动] |
| 停止服务 | 🛑 | [停止] |
| 重启服务 | 🔄 | [重启] |
| 用户管理 | 👥 | [用户] |
| 配置管理 | ⚙️ | [配置] |
| 查看日志 | 📝 | [日志] |
| 退出 | ❌ | [退出] |

**理由**：
- ASCII 方案 100% 兼容性保证
- 括号标记在无色输出时依然清晰可读
- 与日志级别标准（INFO, WARN, ERROR）保持一致
- 易于用户理解，无需学习成本

**替代方案考虑**：
- ✗ **仅使用 Unicode 符号**：Windows CMD 兼容性差
- ✗ **复杂的 Box Drawing 字符**：增加宽度，80列兼容性差
- ✗ **彩色块+文本**：依赖颜色支持，违反需求

---

## 3. TTY 检测和输出适配

### 决策：基于 isTTY 的三种输出模式

**研究结果**：
- 交互式终端（TTY）：需要颜色、格式化、动画
- 管道输出（非TTY）：需要纯文本，无 ANSI 代码
- `--no-color` 标志：用户显式禁用颜色

**输出模式策略**：

| 模式 | 检测条件 | 输出特性 |
|------|---------|---------|
| **Rich Mode** | isTTY + color支持 | 颜色 + 文本指示符 + 格式化 |
| **Plain TTY** | isTTY + --no-color | 无颜色 + 文本指示符 + 格式化 |
| **Pipe Mode** | !isTTY | 纯文本 + 时间戳 + 无格式化 |

**实现要点**：
```typescript
// logger 自动适配
function getOutputMode(): OutputMode {
  const isTTY = process.stdout.isTTY;
  const noColor = globalOptions.noColor;

  if (!isTTY) return OutputMode.PIPE;
  if (noColor) return OutputMode.PLAIN_TTY;
  return OutputMode.RICH;
}

// 根据模式调整输出
function formatMessage(level: LogLevel, message: string): string {
  const mode = getOutputMode();
  const indicator = getIndicator(level, mode);

  switch (mode) {
    case OutputMode.RICH:
      return chalk[color](indicator + ' ' + message);
    case OutputMode.PLAIN_TTY:
      return indicator + ' ' + message;
    case OutputMode.PIPE:
      return `[${timestamp}] ${indicator} ${message}`;
  }
}
```

**理由**：
- 自动适配用户环境，无需手动配置
- 管道输出友好（`xm status | grep error` 可正常工作）
- 符合 Unix 工具设计哲学（管道兼容）

**替代方案考虑**：
- ✗ **始终输出 ANSI 代码**：破坏管道输出
- ✗ **环境变量控制**：增加用户配置负担
- ✗ **配置文件控制**：过度设计

---

## 4. 测试策略（不同终端环境）

### 决策：单元测试 + 集成测试 + 手动验证

**测试层级**：

#### 4.1 单元测试（自动化）
**目标**：验证核心逻辑正确性

测试用例：
- `terminal.test.ts`：
  - ✓ 检测 TTY 状态
  - ✓ 检测颜色支持
  - ✓ 检测终端宽度
  - ✓ 平台识别（Windows/Linux/macOS）

- `icons.test.ts`：
  - ✓ 所有状态指示符映射正确
  - ✓ Unicode/ASCII 降级逻辑
  - ✓ 菜单图标替换完整性

- `logger.test.ts`：
  - ✓ 各日志级别输出正确
  - ✓ Rich/Plain/Pipe 模式切换
  - ✓ 颜色开关控制
  - ✓ 时间戳格式

**工具**：Vitest + 环境变量 mock

#### 4.2 集成测试（自动化）
**目标**：验证端到端场景

测试用例：
- `ui-compatibility.test.ts`：
  - ✓ 模拟 TTY 环境测试
  - ✓ 模拟管道输出测试
  - ✓ 模拟 `--no-color` 标志
  - ✓ 验证 80 列宽度兼容性

**技术**：使用 `spawn` 创建子进程，捕获真实输出

#### 4.3 手动验证（关键环境）
**目标**：真实环境兼容性确认

必测环境：
- ✓ Linux (Ubuntu/Debian) - bash
- ✓ Windows CMD (CP936 编码)
- ✓ Windows PowerShell
- ✓ macOS Terminal
- ✓ SSH 最小终端（PuTTY）
- ✓ 管道输出：`xm status | cat`

验证清单：
- 无乱码或方框字符
- 文本指示符清晰可读
- 80 列宽度无换行
- 菜单选项完整显示

**理由**：
- 自动化测试覆盖逻辑正确性（90%）
- 手动测试覆盖真实环境兼容性（10%，关键）
- 平衡测试成本和质量保证

**替代方案考虑**：
- ✗ **仅单元测试**：无法发现真实环境问题
- ✗ **完全手动测试**：效率低，难以持续
- ✗ **Docker 容器测试所有平台**：过度复杂，Windows 测试困难

---

## 5. 依赖和工具选择

### 现有依赖（无需新增）
- `chalk@4.1.2`：颜色支持和自动检测
- `@inquirer/prompts@8.1.0`：交互式菜单
- `ora@9.0.0`：加载动画

### 不需要的依赖
- ❌ `supports-color`：chalk 已包含
- ❌ `strip-ansi`：chalk 提供 `chalk.reset`
- ❌ `terminal-kit`：功能过重
- ❌ `ansi-escapes`：chalk 足够

**决策理由**：
- 充分利用现有依赖能力
- 避免依赖膨胀
- 降低维护成本

---

## 6. 性能考量

### 性能目标
- CLI 启动时间：<2 秒（无回归）
- 菜单切换响应：<100ms
- 终端检测开销：<5ms（一次性）

### 优化策略
1. **延迟检测**：终端能力检测结果缓存，避免重复计算
2. **简单逻辑**：指示符映射使用对象字典（O(1)查找）
3. **避免正则**：文本替换使用简单字符串操作

### 性能测试
- 使用 `console.time()` 测量关键路径
- Vitest benchmark 验证无性能回归

---

## 总结

### 关键决策
1. ✅ 使用 Node.js 内置 TTY 模块（无额外依赖）
2. ✅ ASCII 文本指示符（100% 兼容性）
3. ✅ 分层输出模式（Rich/Plain/Pipe）
4. ✅ 单元测试 + 集成测试 + 手动验证

### 风险和缓解
| 风险 | 缓解措施 |
|------|---------|
| 某些终端不支持 Unicode | ASCII 降级确保基础可用性 |
| 80 列宽度限制菜单文本 | 缩短菜单文本，测试验证 |
| Windows 编码问题 | 手动测试 CP936 环境 |

### 下一步
Phase 1: 根据研究结果设计数据模型和 API 契约
