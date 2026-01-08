# TypeScript API Contracts

**Feature**: 003-cli-ui-optimization
**Date**: 2026-01-08
**Purpose**: 定义模块间的类型契约和接口规范

---

## 模块导出契约

### 1. `src/utils/terminal.ts`

```typescript
/**
 * 终端能力检测模块
 */

// 类型定义
export enum Platform {
  WIN32 = 'win32',
  LINUX = 'linux',
  DARWIN = 'darwin',
  FREEBSD = 'freebsd',
  OTHER = 'other',
}

export interface TerminalCapabilities {
  /** 是否为交互式终端 */
  isTTY: boolean;

  /** 是否支持颜色输出 */
  supportsColor: boolean;

  /** 是否支持 Unicode 字符 */
  supportsUnicode: boolean;

  /** 终端宽度（列数） */
  width: number;

  /** 终端高度（行数，可选） */
  height?: number;

  /** 操作系统平台 */
  platform: Platform;

  /** TERM 环境变量值（可选） */
  term?: string;
}

// 函数契约
/**
 * 检测当前终端的能力
 * @returns 终端能力对象
 * @throws 不抛出异常，失败时返回安全默认值
 */
export function detectTerminalCapabilities(): TerminalCapabilities;

/**
 * 判断是否为 Windows 平台
 * @returns 是否为 Windows
 */
export function isWindows(): boolean;

/**
 * 判断终端是否支持 Unicode
 * @param term - TERM 环境变量值
 * @param platform - 操作系统平台
 * @returns 是否支持 Unicode
 */
export function supportsUnicode(term: string | undefined, platform: Platform): boolean;
```

---

### 2. `src/utils/icons.ts`

```typescript
/**
 * 图标/指示符解析模块
 */

import { LogLevel } from './logger';
import { TerminalCapabilities } from './terminal';

// 类型定义
export interface StatusIndicator {
  /** 日志级别 */
  level: LogLevel;

  /** Unicode 符号 */
  unicode: string;

  /** ASCII 备选方案 */
  ascii: string;

  /** 关联颜色（chalk 方法名） */
  color: 'green' | 'red' | 'yellow' | 'cyan' | 'blue' | 'gray';
}

export interface MenuIcon {
  /** 原始 emoji（已弃用，仅用于迁移对比） */
  emoji?: string;

  /** 文本替代方案 */
  text: string;
}

// 函数契约
/**
 * 根据日志级别和终端能力解析合适的图标
 * @param level - 日志级别
 * @param capabilities - 终端能力
 * @returns 图标字符串（Unicode 或 ASCII）
 */
export function resolveIcon(level: LogLevel, capabilities: TerminalCapabilities): string;

/**
 * 获取状态指示符完整信息
 * @param level - 日志级别
 * @returns 状态指示符对象
 * @throws Error 如果日志级别无效
 */
export function getStatusIndicator(level: LogLevel): StatusIndicator;

/**
 * 根据菜单键获取图标
 * @param key - 菜单键（如 'START', 'STOP'）
 * @returns 菜单图标对象
 * @throws Error 如果菜单键未定义
 */
export function getMenuIcon(key: string): MenuIcon;
```

---

### 3. `src/constants/ui-symbols.ts`

```typescript
/**
 * UI 符号常量定义
 */

// 常量导出
export const statusIcons: Readonly<{
  SUCCESS: string;
  ERROR: string;
  WARN: string;
  INFO: string;
  DEBUG: string;
  LOADING: string;
  PROGRESS: string;
  HINT: string;
}>;

export const menuIcons: Readonly<{
  STATUS: string;
  START: string;
  STOP: string;
  RESTART: string;
  USER: string;
  CONFIG: string;
  LOGS: string;
  EXIT: string;
}>;

// 映射表导出
export const STATUS_INDICATORS: ReadonlyMap<LogLevel, StatusIndicator>;
export const MENU_ICONS: ReadonlyMap<string, MenuIcon>;
```

---

### 4. `src/utils/logger.ts` (扩展)

```typescript
/**
 * 日志工具模块（扩展现有接口）
 */

// 新增类型
export enum OutputMode {
  /** 完整模式：颜色 + 格式化 */
  RICH = 'rich',

  /** 朴素模式：无颜色 + 格式化 */
  PLAIN_TTY = 'plain_tty',

  /** 管道模式：纯文本 + 时间戳 */
  PIPE = 'pipe',
}

export interface LogOptions {
  /** 是否启用颜色（默认 true） */
  color?: boolean;

  /** 是否显示时间戳（默认 false） */
  timestamp?: boolean;

  /** 最小日志级别（用于过滤） */
  level?: LogLevel;

  /** 输出模式（可选，默认自动检测） */
  mode?: OutputMode;

  /** 最大输出宽度（默认 80） */
  maxWidth?: number;
}

// 新增函数
/**
 * 获取当前输出模式
 * @returns 输出模式
 */
export function getOutputMode(): OutputMode;

/**
 * 设置输出模式（仅用于测试）
 * @param mode - 输出模式
 */
export function setOutputMode(mode: OutputMode): void;

// 现有函数保持不变
export function debug(...args: unknown[]): void;
export function info(...args: unknown[]): void;
export function success(...args: unknown[]): void;
export function warn(...args: unknown[]): void;
export function error(...args: unknown[]): void;
export function title(message: string): void;
export function separator(char?: string, length?: number): void;
export function tableHeader(title: string): void;
export function loading(message: string): void;
export function progress(message: string): void;
export function hint(message: string): void;
export function keyValue(key: string, value: string, keyColor?: ChalkFunction): void;
export function newline(count?: number): void;
export function listItem(message: string, symbol?: string): void;
export function code(code: string): void;
export function configure(options: LogOptions): void;
```

---

### 5. `src/types/terminal.ts` (新增)

```typescript
/**
 * 终端相关类型定义
 */

import { Platform, TerminalCapabilities } from '../utils/terminal';
import { OutputMode } from '../utils/logger';

// 重新导出核心类型
export { Platform, TerminalCapabilities, OutputMode };

// 扩展类型
export type ChalkColor = 'green' | 'red' | 'yellow' | 'cyan' | 'blue' | 'gray' | 'white' | 'black';

export interface OutputFormatter {
  format(message: string, level: LogLevel, mode: OutputMode): string;
}

export interface IconResolver {
  resolve(level: LogLevel, capabilities: TerminalCapabilities): string;
}
```

---

## 契约验证规则

### 输入验证

#### `detectTerminalCapabilities()`
- **前置条件**：无
- **后置条件**：
  - 返回值不为 null
  - `width` >= 40
  - `platform` 必须是有效的 Platform 枚举值

#### `resolveIcon(level, capabilities)`
- **前置条件**：
  - `level` 必须是有效的 LogLevel 枚举值
  - `capabilities` 必须是有效的 TerminalCapabilities 对象
- **后置条件**：
  - 返回值长度 >= 1
  - 返回值长度 <= 8
  - 如果 `capabilities.supportsUnicode === false`，返回值必须是 ASCII

#### `getStatusIndicator(level)`
- **前置条件**：
  - `level` 必须是有效的 LogLevel 枚举值
- **后置条件**：
  - 返回对象包含所有必需字段
  - `unicode` 是单字符
  - `ascii` 符合 `[LABEL]` 格式
- **异常**：
  - 抛出 `Error` 如果 `level` 无效

#### `getMenuIcon(key)`
- **前置条件**：
  - `key` 是非空字符串
- **后置条件**：
  - 返回对象包含 `text` 字段
  - `text` 符合 `[标签]` 格式
  - `text` 长度 <= 6
- **异常**：
  - 抛出 `Error` 如果 `key` 未定义

---

## 使用示例

### 示例 1：基础日志输出

```typescript
import logger from './utils/logger';

// 自动检测终端能力并适配输出
logger.info('Starting service');       // [INFO] Starting service 或 i Starting service
logger.success('Service started');     // [OK] Service started 或 ✓ Service started
logger.error('Failed to start');       // [ERROR] Failed to start 或 ✗ Failed to start
```

### 示例 2：显式检测终端

```typescript
import { detectTerminalCapabilities } from './utils/terminal';
import { resolveIcon } from './utils/icons';
import { LogLevel } from './utils/logger';

const caps = detectTerminalCapabilities();
console.log(`Terminal width: ${caps.width}`);
console.log(`Supports color: ${caps.supportsColor}`);

const successIcon = resolveIcon(LogLevel.SUCCESS, caps);
console.log(`${successIcon} Operation completed`);
```

### 示例 3：菜单图标替换

```typescript
import { menuIcons } from './constants/ui-symbols';
import { select } from '@inquirer/prompts';

const answer = await select({
  message: '选择操作',
  choices: [
    { name: `${menuIcons.START} 启动服务`, value: 'start' },
    { name: `${menuIcons.STOP} 停止服务`, value: 'stop' },
    { name: `${menuIcons.RESTART} 重启服务`, value: 'restart' },
  ],
});
```

### 示例 4：测试环境 Mock

```typescript
import { vi } from 'vitest';
import { detectTerminalCapabilities } from './utils/terminal';

// Mock TTY 状态
vi.spyOn(process.stdout, 'isTTY', 'get').mockReturnValue(false);

const caps = detectTerminalCapabilities();
expect(caps.isTTY).toBe(false);

// 验证管道模式行为
// ...
```

---

## 错误处理契约

### 不抛出异常的函数
- `detectTerminalCapabilities()` - 失败时返回安全默认值
- `resolveIcon()` - 失败时返回 ASCII 降级
- `logger.*()` - 所有日志方法捕获内部错误

### 抛出异常的函数
- `getStatusIndicator(invalidLevel)` - 抛出 `Error`
- `getMenuIcon(unknownKey)` - 抛出 `Error`

### 异常格式
```typescript
class InvalidLogLevelError extends Error {
  constructor(level: unknown) {
    super(`Invalid log level: ${level}`);
    this.name = 'InvalidLogLevelError';
  }
}

class UnknownMenuIconError extends Error {
  constructor(key: string) {
    super(`Unknown menu icon key: ${key}`);
    this.name = 'UnknownMenuIconError';
  }
}
```

---

## 性能契约

| 函数 | 最大耗时 | 内存增量 |
|------|---------|---------|
| `detectTerminalCapabilities()` | < 5ms | < 1KB |
| `resolveIcon()` | < 0.1ms | 0 (无分配) |
| `getStatusIndicator()` | < 0.1ms | 0 (查表) |
| `logger.info()` | < 1ms | < 100 bytes |

---

## 向后兼容性契约

### 保证兼容的接口
- ✅ 所有现有 `logger.*()` 方法签名不变
- ✅ `LogLevel` 枚举保持现有值
- ✅ `configure()` 方法接受现有选项

### 废弃的接口
- ⚠️ 无废弃接口（纯新增功能）

### 迁移路径
- 旧代码无需修改即可工作
- Emoji 自动替换为文本，对调用方透明
