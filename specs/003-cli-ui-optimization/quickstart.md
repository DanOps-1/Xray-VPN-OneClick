# Quick Start: CLI User Interface Optimization

**Feature**: 003-cli-ui-optimization
**Date**: 2026-01-08
**Purpose**: 开发人员快速上手指南

---

## 概述

本功能优化 CLI 工具的界面，将 emoji 替换为通用兼容的文本指示符，确保在所有终端环境下正常显示。

**核心改动**：
- ✅ 替换所有 emoji 为 ASCII/Unicode 文本符号
- ✅ 自动检测终端能力并适配输出格式
- ✅ 支持 TTY/管道/无色输出三种模式
- ✅ 保持向后兼容，无需修改调用代码

---

## 快速开始

### 1. 理解新的输出系统

#### 输出模式自动切换

```typescript
// 自动检测终端能力
const capabilities = detectTerminalCapabilities();

// 根据环境自动选择输出模式
if (!capabilities.isTTY) {
  // 管道模式：纯文本 + 时间戳
  logger.info('Starting service');
  // 输出: [12:34:56] [INFO] Starting service
}
else if (options.noColor) {
  // 朴素模式：文本指示符 + 无颜色
  logger.success('Service started');
  // 输出: [OK] Service started
}
else {
  // 完整模式：颜色 + 文本指示符
  logger.success('Service started');
  // 输出: ✓ Service started (绿色)
}
```

#### 状态指示符映射

| 调用方法 | 旧显示 | 新显示（Rich） | 新显示（Plain/Pipe） |
|---------|--------|---------------|---------------------|
| `logger.success()` | ✅ | ✓ (绿色) | `[OK]` |
| `logger.error()` | ❌ | ✗ (红色) | `[ERROR]` |
| `logger.warn()` | ⚠️ | ! (黄色) | `[WARN]` |
| `logger.info()` | (无) | i (青色) | `[INFO]` |
| `logger.hint()` | 💡 | * (青色) | `[TIP]` |

---

### 2. 使用新的工具模块

#### 检测终端能力

```typescript
import { detectTerminalCapabilities } from './utils/terminal';

const capabilities = detectTerminalCapabilities();

console.log({
  isTTY: capabilities.isTTY,           // 是否交互式终端
  supportsColor: capabilities.supportsColor,  // 是否支持颜色
  supportsUnicode: capabilities.supportsUnicode,  // 是否支持 Unicode
  width: capabilities.width,           // 终端宽度（列数）
  platform: capabilities.platform      // 操作系统平台
});
```

#### 解析图标

```typescript
import { resolveIcon } from './utils/icons';
import { LogLevel } from './utils/logger';

// 根据日志级别和终端能力获取合适的图标
const indicator = resolveIcon(LogLevel.SUCCESS, capabilities);
console.log(indicator);  // ✓ 或 [OK]（取决于终端）
```

---

### 3. 迁移现有代码

#### 无需修改的场景

✅ **日志调用**：所有现有 `logger.*()` 调用无需修改
```typescript
// 现有代码保持不变
logger.info('Processing request');
logger.success('Request completed');
logger.error('Request failed');
```

✅ **配置选项**：现有配置参数保持兼容
```typescript
// 现有配置保持不变
logger.configure({
  color: false,    // 禁用颜色
  timestamp: true  // 启用时间戳
});
```

#### 需要修改的场景

⚠️ **菜单选项**：需要替换 emoji 为文本图标
```typescript
// 旧代码
const options = [
  { name: '🚀 启动服务', value: 'start' },
  { name: '🛑 停止服务', value: 'stop' }
];

// 新代码
import { menuIcons } from './constants/ui-symbols';

const options = [
  { name: `${menuIcons.START} 启动服务`, value: 'start' },
  { name: `${menuIcons.STOP} 停止服务`, value: 'stop' }
];
// 输出: [启动] 启动服务
//      [停止] 停止服务
```

⚠️ **硬编码 emoji**：需要替换为常量
```typescript
// 旧代码
console.log('✅ Success');

// 新代码
import { statusIcons } from './constants/ui-symbols';
console.log(`${statusIcons.SUCCESS} Success`);
```

---

### 4. 添加新的日志消息

#### 使用现有日志方法

```typescript
import logger from './utils/logger';

// 基础日志
logger.info('General information');
logger.success('Operation completed');
logger.error('Operation failed');
logger.warn('Warning message');

// 带提示的日志
logger.hint('Try using --verbose flag for more details');

// 分隔和格式化
logger.separator();
logger.title('Configuration Summary');
logger.keyValue('Port', '443');
```

#### 自定义输出（高级）

```typescript
import { resolveIcon } from './utils/icons';
import { LogLevel } from './utils/logger';
import chalk from 'chalk';

const capabilities = detectTerminalCapabilities();
const icon = resolveIcon(LogLevel.WARN, capabilities);

if (capabilities.supportsColor) {
  console.log(chalk.yellow(`${icon} Custom warning`));
} else {
  console.log(`${icon} Custom warning`);
}
```

---

### 5. 编写测试

#### 单元测试示例

```typescript
import { describe, it, expect, vi } from 'vitest';
import { detectTerminalCapabilities } from './utils/terminal';

describe('Terminal Capabilities', () => {
  it('should detect TTY correctly', () => {
    // Mock process.stdout
    vi.spyOn(process.stdout, 'isTTY', 'get').mockReturnValue(true);

    const caps = detectTerminalCapabilities();
    expect(caps.isTTY).toBe(true);
  });

  it('should fallback to 80 columns if width unavailable', () => {
    vi.spyOn(process.stdout, 'columns', 'get').mockReturnValue(undefined);

    const caps = detectTerminalCapabilities();
    expect(caps.width).toBe(80);
  });
});
```

#### 集成测试示例

```typescript
import { spawn } from 'child_process';
import { describe, it, expect } from 'vitest';

describe('UI Compatibility', () => {
  it('should output correct indicators in pipe mode', async () => {
    const proc = spawn('node', ['dist/cli.js', 'status'], {
      stdio: ['ignore', 'pipe', 'pipe']  // Pipe output
    });

    let output = '';
    proc.stdout.on('data', (data) => { output += data.toString(); });

    await new Promise((resolve) => proc.on('close', resolve));

    // 管道模式应该使用 ASCII 指示符
    expect(output).toMatch(/\[INFO\]/);
    expect(output).not.toMatch(/[✓✗]/);  // 不应包含 Unicode 符号
  });
});
```

---

### 6. 调试技巧

#### 查看终端能力

```bash
# 启动 Node REPL
node

# 检查终端信息
> console.log(process.stdout.isTTY)
> console.log(process.stdout.columns)
> console.log(process.env.TERM)
> console.log(process.platform)
```

#### 测试不同输出模式

```bash
# Rich 模式（默认）
npm run build && ./dist/cli.js

# Plain 模式（无颜色）
npm run build && ./dist/cli.js --no-color

# Pipe 模式
npm run build && ./dist/cli.js | cat

# 指定终端宽度
npm run build && COLUMNS=60 ./dist/cli.js
```

#### 查看实际输出字符

```bash
# 使用 hexdump 查看二进制输出
npm run build && ./dist/cli.js status | hexdump -C

# 使用 od 查看字符代码
npm run build && ./dist/cli.js status | od -c
```

---

### 7. 常见问题

#### Q: 为什么我的终端还是显示 emoji？
A: 某些终端会强制渲染 Unicode 为 emoji。新代码使用的是基础 Unicode 符号（如 ✓），不是真正的 emoji（如 ✅）。如果仍有问题，请检查终端配置。

#### Q: 如何强制使用 ASCII 模式？
A: 使用 `--no-color` 标志或设置环境变量：
```bash
TERM=dumb ./dist/cli.js
```

#### Q: 管道输出时为什么有时间戳？
A: 管道模式会自动添加时间戳，便于日志分析。如不需要，可在代码中配置：
```typescript
logger.configure({ timestamp: false });
```

#### Q: 80 列宽度限制太严格怎么办？
A: 80 列是最小兼容宽度。现代终端通常更宽，代码会自动适配。如需调整：
```typescript
logger.configure({ maxWidth: 120 });
```

---

### 8. 开发工作流

#### 步骤 1：实现新模块
```bash
# 创建新文件
touch src/utils/terminal.ts
touch src/utils/icons.ts
touch src/constants/ui-symbols.ts

# 编写代码（参考 data-model.md）
```

#### 步骤 2：编写测试（TDD）
```bash
# 创建测试文件
touch tests/unit/terminal.test.ts
touch tests/unit/icons.test.ts

# 运行测试（应该失败 - 红）
npm run test

# 实现功能直到测试通过（绿）
npm run test:watch
```

#### 步骤 3：重构现有代码
```bash
# 修改 logger.ts
# 替换 emoji 为新的图标系统

# 修改 interactive.ts
# 替换菜单 emoji

# 运行所有测试
npm run test

# 检查覆盖率
npm run test:coverage
```

#### 步骤 4：手动验证
```bash
# 构建项目
npm run build

# 在不同环境测试
# - Linux terminal
# - Windows CMD
# - SSH session
# - Pipe output: ./dist/cli.js | cat
```

---

### 9. 性能检查

```typescript
// 测量终端检测耗时
console.time('detect');
const caps = detectTerminalCapabilities();
console.timeEnd('detect');
// 预期: < 5ms

// 测量图标解析耗时
console.time('resolve');
for (let i = 0; i < 10000; i++) {
  resolveIcon(LogLevel.INFO, caps);
}
console.timeEnd('resolve');
// 预期: < 10ms (10k iterations)
```

---

### 10. 发布前检查清单

- [ ] 所有单元测试通过（`npm run test`）
- [ ] 测试覆盖率 > 80%（`npm run test:coverage`）
- [ ] ESLint 无错误（`npm run lint`）
- [ ] 在 Windows CMD 手动测试（无乱码）
- [ ] 在 Linux terminal 手动测试
- [ ] 管道输出测试（`xm status | cat`）
- [ ] 80 列宽度测试（`COLUMNS=80 xm`）
- [ ] 更新 README.md（添加终端兼容性说明）
- [ ] 更新 CHANGELOG.md

---

## 参考资料

- [Data Model](./data-model.md) - 完整数据结构定义
- [Research](./research.md) - 技术研究和决策背景
- [Spec](./spec.md) - 功能规格说明
- [Node.js TTY 文档](https://nodejs.org/api/tty.html)
- [Chalk 库文档](https://github.com/chalk/chalk)
- [Vitest 测试框架](https://vitest.dev/)
