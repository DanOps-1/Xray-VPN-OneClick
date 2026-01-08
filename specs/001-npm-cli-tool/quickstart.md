# Quickstart Guide: Xray 服务管理 CLI 工具开发

**Feature**: npm-installable CLI tool for Xray service management
**Date**: 2026-01-07
**Phase 1**: Developer Onboarding
**Input**: [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

---

## 目标读者

本指南面向将要实现此 CLI 工具的开发者，提供快速上手所需的所有信息。

---

## 📋 前置要求

### 必需软件
- **Node.js**: >= 18.0.0 (推荐 20.x LTS)
- **npm**: >= 9.0.0
- **TypeScript**: >= 5.0.0
- **Git**: 用于版本控制
- **Linux环境**: Debian/Ubuntu/CentOS/Kali (带 systemd)

### 开发工具（推荐）
- **VS Code**: 推荐 IDE
- **VS Code 扩展**:
  - ESLint
  - Prettier
  - TypeScript + JavaScript Grammar
  - Jest / Vitest Runner

---

## 🚀 快速开始（5 分钟）

### 1. 项目初始化

```bash
# 创建项目目录
mkdir xray-manager
cd xray-manager

# 初始化 npm 项目
npm init -y

# 安装核心依赖
npm install @inquirer/prompts commander chalk@4 ora clipboardy

# 安装开发依赖
npm install -D typescript @types/node vitest @vitest/ui c8 \
                 eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
                 prettier

# 初始化 TypeScript
npx tsc --init
```

### 2. 配置项目

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
});
```

**package.json** (关键部分):
```json
{
  "name": "xray-manager",
  "version": "1.0.0",
  "description": "Xray VPN 服务管理 CLI 工具",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "xray-manager": "./dist/cli.js",
    "xm": "./dist/cli.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "lint": "eslint src tests --ext .ts",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["xray", "vpn", "cli", "systemd"],
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3. 创建项目结构

```bash
mkdir -p src/{cli,commands,services,utils,types}
mkdir -p tests/{unit,integration,fixtures}
mkdir -p bin
```

### 4. Hello World CLI

**src/cli.ts**:
```typescript
#!/usr/bin/env node

import chalk from 'chalk';

console.log(chalk.green('✅ Xray Manager CLI 正在运行！'));
console.log(chalk.cyan('版本: 1.0.0'));
```

**构建并测试**:
```bash
# 编译
npm run build

# 本地测试（模拟全局安装）
npm link

# 测试运行
xray-manager
# 或
xm

# 看到输出说明成功！
# ✅ Xray Manager CLI 正在运行！
# 版本: 1.0.0
```

---

## 📁 项目结构

```
xray-manager/
├── src/
│   ├── cli.ts                 # CLI 入口点（shebang）
│   ├── index.ts               # 库入口（导出公共 API）
│   │
│   ├── commands/              # 命令处理器
│   │   ├── interactive.ts     # 交互式菜单
│   │   ├── service.ts         # 服务管理命令
│   │   ├── user.ts            # 用户管理命令
│   │   ├── config.ts          # 配置管理命令
│   │   └── logs.ts            # 日志查看命令
│   │
│   ├── services/              # 业务逻辑服务
│   │   ├── systemd-manager.ts # systemd 封装
│   │   ├── config-manager.ts  # 配置文件管理
│   │   ├── user-manager.ts    # 用户管理
│   │   └── backup-manager.ts  # 备份管理
│   │
│   ├── utils/                 # 工具函数
│   │   ├── prompt.ts          # 提示工具
│   │   ├── logger.ts          # 日志工具
│   │   ├── validator.ts       # 输入验证
│   │   ├── clipboard.ts       # 剪贴板操作
│   │   └── format.ts          # 格式化工具
│   │
│   ├── types/                 # TypeScript 类型定义
│   │   ├── config.ts          # XrayConfig 类型
│   │   ├── service.ts         # ServiceStatus 类型
│   │   ├── user.ts            # User 类型
│   │   └── index.ts           # 导出所有类型
│   │
│   └── constants/             # 常量定义
│       ├── exit-codes.ts      # 退出代码
│       ├── paths.ts           # 默认路径
│       └── timeouts.ts        # 超时配置
│
├── tests/
│   ├── unit/                  # 单元测试
│   │   ├── services/
│   │   │   ├── systemd-manager.test.ts
│   │   │   ├── config-manager.test.ts
│   │   │   └── user-manager.test.ts
│   │   └── utils/
│   │       ├── validator.test.ts
│   │       └── format.test.ts
│   │
│   ├── integration/           # 集成测试
│   │   ├── cli-workflow.test.ts
│   │   ├── service-lifecycle.test.ts
│   │   └── user-management.test.ts
│   │
│   └── fixtures/              # 测试数据
│       ├── mock-config.json
│       ├── mock-users.json
│       └── mock-systemd-output.txt
│
├── bin/                       # 构建产物（不提交）
│   └── xray-manager.js
│
├── dist/                      # 编译产物（不提交）
│
├── coverage/                  # 覆盖率报告（不提交）
│
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## 🧪 TDD 工作流（红-绿-重构）

### 基本循环

```bash
# 终端 1: 始终运行 watch 模式
npm run test:watch

# 终端 2: 开发
```

### 示例：实现服务状态查询

#### 1. RED - 先写测试（失败）

**tests/unit/services/systemd-manager.test.ts**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { SystemdManager } from '../../../src/services/systemd-manager';

describe('SystemdManager', () => {
  describe('getStatus', () => {
    it('should return service status', async () => {
      const manager = new SystemdManager('xray');
      const status = await manager.getStatus();

      expect(status).toMatchObject({
        serviceName: 'xray',
        active: expect.any(Boolean),
        activeState: expect.any(String)
      });
    });
  });
});
```

运行 `npm run test:watch`，测试失败（SystemdManager 类不存在）。

#### 2. GREEN - 最小实现（通过）

**src/services/systemd-manager.ts**:
```typescript
export class SystemdManager {
  constructor(private serviceName: string) {}

  async getStatus() {
    return {
      serviceName: this.serviceName,
      active: false,
      activeState: 'unknown'
    };
  }
}
```

测试通过！但这不是真实实现。

#### 3. REFACTOR - 完整实现

**src/services/systemd-manager.ts**:
```typescript
import { spawn } from 'child_process';

export interface ServiceStatus {
  serviceName: string;
  active: boolean;
  activeState: string;
  subState?: string;
  pid?: number;
  uptime?: string;
  memory?: string;
}

export class SystemdManager {
  constructor(private serviceName: string) {}

  async getStatus(): Promise<ServiceStatus> {
    const properties = ['ActiveState', 'SubState', 'MainPID', 'MemoryCurrent'];
    const args = ['show', this.serviceName, `--property=${properties.join(',')}`];

    const result = await this.executeSystemctl('show', args);

    // 解析 key=value 输出
    const parsed: any = {};
    result.stdout.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) parsed[key] = value;
    });

    return {
      serviceName: this.serviceName,
      active: parsed.ActiveState === 'active',
      activeState: parsed.ActiveState,
      subState: parsed.SubState,
      pid: parseInt(parsed.MainPID) || undefined,
      memory: this.formatBytes(parseInt(parsed.MemoryCurrent))
    };
  }

  private async executeSystemctl(action: string, args: string[]): Promise<{stdout: string}> {
    return new Promise((resolve, reject) => {
      const child = spawn('systemctl', args);
      let stdout = '';

      child.stdout.on('data', (data) => stdout += data);
      child.on('close', (code) => {
        code === 0 ? resolve({ stdout }) : reject(new Error(`Exit code: ${code}`));
      });
    });
  }

  private formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}
```

测试仍然通过，现在有了真实实现！

#### 4. COMMIT - 提交

```bash
git add src/services/systemd-manager.ts tests/unit/services/systemd-manager.test.ts
git commit -m "feat: implement SystemdManager.getStatus()"
```

---

## 📐 关键模块实现指南

### 1. systemd 服务管理

参考文档: [research.md - systemd 管理最佳实践](./research.md#2-systemd-服务管理最佳实践)

**关键点**:
- 使用 `spawn()` 而非 `exec()`（防止命令注入）
- 白名单验证操作和服务名
- 优雅关闭：10 秒超时 + SIGTERM/SIGKILL
- 解析 `systemctl show` 的机器可读输出

**示例**:
```typescript
// src/services/systemd-manager.ts
async restart(): Promise<void> {
  console.log('🔄 准备重启服务...');
  console.log('⏱️  预计中断时间: 5-10 秒');

  // 优雅停止（10秒超时）
  await this.executeSystemctl('stop', { timeout: 10000 });
  await sleep(1000);

  // 启动
  await this.executeSystemctl('start', { timeout: 15000 });

  // 验证
  const status = await this.getStatus();
  if (!status.active) {
    throw new Error('服务重启后启动失败');
  }

  console.log('✅ 服务重启成功');
}
```

---

### 2. 交互式菜单

参考文档: [research.md - CLI 框架选型](./research.md#11-交互式菜单系统)

**关键点**:
- 使用 `@inquirer/prompts` 的 `select` 类型
- 使用 Chalk 4.x 为选项添加颜色和图标
- 实现菜单栈以支持返回

**示例**:
```typescript
// src/commands/interactive.ts
import { select } from '@inquirer/prompts';
import chalk from 'chalk';

export async function showMainMenu(): Promise<void> {
  const choice = await select({
    message: '请选择操作:',
    choices: [
      { name: chalk.cyan('📊 查看服务状态'), value: 'status' },
      { name: chalk.green('🚀 启动服务'), value: 'start' },
      { name: chalk.red('🛑 停止服务'), value: 'stop' },
      { name: chalk.yellow('🔄 重启服务'), value: 'restart' },
      { type: 'separator' },
      { name: chalk.blue('👥 用户管理'), value: 'user' },
      { name: chalk.magenta('⚙️  配置管理'), value: 'config' },
      { name: chalk.gray('📝 查看日志'), value: 'logs' },
      { type: 'separator' },
      { name: chalk.red('❌ 退出'), value: 'exit' }
    ]
  });

  // 根据选择执行对应操作
  switch (choice) {
    case 'status':
      await handleServiceStatus();
      break;
    case 'user':
      await showUserMenu();
      break;
    // ... 其他选项
  }
}
```

---

### 3. 敏感信息脱敏（符合 CR-001）

参考文档: [data-model.md - 数据转换](./data-model.md#8-data-transformation-数据转换)

**关键点**:
- 默认脱敏显示（前4后4）
- 提供剪贴板复制完整内容
- `--full` 标志显示完整信息（需确认）

**示例**:
```typescript
// src/utils/format.ts
import clipboardy from 'clipboardy';
import chalk from 'chalk';

export interface MaskedValue {
  masked: string;
  original: string;
}

export function maskSensitiveValue(
  value: string,
  prefixLength = 4,
  suffixLength = 4
): MaskedValue {
  if (value.length <= prefixLength + suffixLength) {
    return {
      masked: '*'.repeat(value.length),
      original: value
    };
  }

  const prefix = value.slice(0, prefixLength);
  const suffix = value.slice(-suffixLength);
  const maskLength = value.length - prefixLength - suffixLength;

  return {
    masked: `${prefix}${'*'.repeat(maskLength)}${suffix}`,
    original: value
  };
}

export async function showWithCopyOption(label: string, value: string): Promise<void> {
  const { masked, original } = maskSensitiveValue(value);

  console.log(`${label}: ${chalk.yellow(masked)}  ${chalk.dim('[按 C 复制完整]')}`);

  // 实际实现中，需要监听键盘事件
  // 这里简化为直接提供复制选项
  const { confirm } = await import('@inquirer/prompts');
  const shouldCopy = await confirm({ message: '复制完整内容?' });

  if (shouldCopy) {
    await clipboardy.write(original);
    console.log(chalk.green('✅ 已复制到剪贴板'));
  }
}

// 使用示例
const uuid = '12345678-1234-4567-8901-abcdefabcdef';
await showWithCopyOption('UUID', uuid);
// 输出: UUID: 1234****-****-****-****-********cdef  [按 C 复制完整]
```

---

### 4. 配置文件管理

参考文档: [data-model.md - XrayConfig](./data-model.md#11-xrayconfig---xray-配置)

**关键点**:
- 验证 JSON 格式
- 修改前自动备份
- 使用 TypeScript 类型确保结构正确

**示例**:
```typescript
// src/services/config-manager.ts
import { readFile, writeFile } from 'fs/promises';
import type { XrayConfig } from '../types/config';

export class ConfigManager {
  constructor(
    private configPath = '/usr/local/etc/xray/config.json',
    private backupDir = '/var/backups/xray/'
  ) {}

  async readConfig(): Promise<XrayConfig> {
    const content = await readFile(this.configPath, 'utf-8');
    const config = JSON.parse(content) as XrayConfig;

    // 验证配置结构
    this.validateConfig(config);

    return config;
  }

  async writeConfig(config: XrayConfig): Promise<void> {
    // 验证
    this.validateConfig(config);

    // 备份现有配置
    await this.backupConfig({ reason: 'auto_before_modify' });

    // 写入新配置
    const content = JSON.stringify(config, null, 2);
    await writeFile(this.configPath, content, { mode: 0o600 });  // 权限 600
  }

  private validateConfig(config: XrayConfig): void {
    if (!config.inbounds || config.inbounds.length === 0) {
      throw new Error('配置必须包含至少一个 inbound');
    }

    if (!config.outbounds || config.outbounds.length === 0) {
      throw new Error('配置必须包含至少一个 outbound');
    }

    // 更多验证...
  }

  async backupConfig(options: { reason: string }): Promise<string> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = `${this.backupDir}config.${timestamp}.json`;

    const content = await readFile(this.configPath, 'utf-8');
    await writeFile(backupPath, content);

    console.log(chalk.green('✅ 配置已备份:'), backupPath);
    return backupPath;
  }
}
```

---

## 🧪 测试策略

### 单元测试

测试纯函数和业务逻辑：

```typescript
// tests/unit/utils/validator.test.ts
import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidUuid } from '../../../src/utils/validator';

describe('Validator', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });
});
```

### 集成测试

测试命令端到端流程：

```typescript
// tests/integration/cli-workflow.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

describe('CLI Workflow', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'xray-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should display service status', async () => {
    const child = spawn('node', ['./dist/cli.js', 'service', 'status'], {
      cwd: testDir,
      env: { ...process.env, XRAY_TEST_MODE: 'true' }
    });

    let output = '';
    child.stdout.on('data', (chunk) => output += chunk.toString());

    const exitCode = await new Promise((resolve) => {
      child.on('close', resolve);
    });

    expect(exitCode).toBe(0);
    expect(output).toContain('服务状态');
  });
});
```

---

## 🔧 调试技巧

### 1. 使用 `npm link` 本地测试

```bash
# 在项目目录
npm run build
npm link

# 现在可以全局使用命令
xray-manager --help
xm service status

# 取消链接
npm unlink -g xray-manager
```

### 2. 使用测试模式

在代码中添加测试模式检测：

```typescript
const isTestMode = process.env.NODE_ENV === 'test' ||
                   process.env.XRAY_TEST_MODE === 'true';

if (isTestMode) {
  console.log('[TEST MODE] Skipping actual systemd call');
  return mockResult;
}
```

### 3. 调试 systemctl 输出

```typescript
// 临时打印原始输出
const result = await executeSystemctl('show', 'xray');
console.log('Raw output:', result.stdout);
console.log('Parsed:', parseSystemctlShow(result.stdout));
```

---

## 📦 发布准备

### 1. 版本控制

```bash
# 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.1.0 -> 2.0.0
```

### 2. 发布前检查清单

- [ ] 所有测试通过 (`npm run test`)
- [ ] 代码覆盖率达标 (`npm run test:coverage`)
- [ ] Linting 无错误 (`npm run lint`)
- [ ] 文档更新（README.md）
- [ ] CHANGELOG.md 更新
- [ ] package.json 版本号正确
- [ ] `npm run build` 成功

### 3. 发布到 npm

```bash
# 登录 npm
npm login

# 发布
npm publish

# 验证
npm view xray-manager
```

---

## 🆘 常见问题

### Q: `spawn ENOENT` 错误？

**A**: systemctl 命令不在 PATH 中。确保在 Linux 系统上运行。

### Q: 权限错误 `EACCES`？

**A**: 许多操作需要 root 权限。提示用户使用 `sudo`。

### Q: 测试时如何避免真实 systemd 调用？

**A**: 使用 `vi.spyOn()` mock `spawn` 函数：

```typescript
import * as cp from 'child_process';
import { EventEmitter } from 'events';

const fakeProcess = new EventEmitter() as any;
fakeProcess.stdout = new EventEmitter();
fakeProcess.stderr = new EventEmitter();

vi.spyOn(cp, 'spawn').mockReturnValue(fakeProcess);
```

### Q: 如何测试交互式提示？

**A**: mock `inquirer.prompt`:

```typescript
import inquirer from 'inquirer';

vi.spyOn(inquirer, 'prompt').mockResolvedValue({ action: 'start' });
```

---

## 📚 推荐阅读

### 官方文档
- [Node.js child_process](https://nodejs.org/api/child_process.html)
- [Vitest 官方文档](https://vitest.dev/)
- [@inquirer/prompts 文档](https://github.com/SBoudrias/Inquirer.js/tree/master/packages/prompts)
- [Commander.js 文档](https://github.com/tj/commander.js)

### 项目内文档
- [spec.md](./spec.md) - 完整功能规范
- [research.md](./research.md) - 技术调研报告
- [data-model.md](./data-model.md) - 数据模型定义
- [contracts/](./contracts/) - 命令接口合约

---

## 🎯 下一步

1. **实现核心模块**:
   - [ ] SystemdManager (服务管理)
   - [ ] ConfigManager (配置管理)
   - [ ] UserManager (用户管理)

2. **实现命令处理器**:
   - [ ] Interactive Menu (交互式菜单)
   - [ ] Service Commands (服务命令)
   - [ ] User Commands (用户命令)

3. **编写测试**:
   - [ ] 单元测试 (80% 覆盖率)
   - [ ] 集成测试
   - [ ] E2E 测试

4. **完善文档**:
   - [ ] README.md
   - [ ] CHANGELOG.md
   - [ ] API 文档

---

**最后更新**: 2026-01-07
**状态**: ✅ 已完成
**预计开发时间**: 2-3 周（1 名开发者，TDD 方式）
