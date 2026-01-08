# Research Report: Xray 服务管理 CLI 工具技术调研

**Feature**: npm-installable CLI tool for Xray service management
**Date**: 2026-01-07
**Phase 0**: Technical Research
**Input**: [spec.md](./spec.md), [plan.md](./plan.md)

---

## Executive Summary

本报告汇总了三个关键技术领域的调研结果，为实现 Xray 服务管理 CLI 工具提供技术选型依据。主要结论：

- **CLI 框架**: 使用 `@inquirer/prompts` (交互菜单) + `Commander.js` (参数解析) + `Chalk 4.x` (终端样式)
- **systemd 管理**: 使用 `child_process.spawn()` 执行 systemctl，采用优雅关闭策略（10秒超时）
- **测试框架**: 使用 `Vitest` (10-20倍速度提升) + `c8` (原生 V8 覆盖率)，遵循红-绿-重构 TDD 流程

---

## 1. Node.js CLI 框架和库选型

### 1.1 交互式菜单系统

**选择**: **@inquirer/prompts** (现代化 Inquirer.js)

**理由**:
- **市场主导地位**: 3900 万周下载量，21,309 GitHub stars
- **最全面的提示类型**: input、list、checkbox、password、confirm 等
- **TypeScript 原生支持**: 内置类型定义，无需额外配置
- **现代化重构**: 新版本显著减少 bundle size，性能大幅提升
- **生态成熟**: 被 98,460+ 项目使用，文档齐全

**备选方案**:
- **Prompts** (3300万周下载): 轻量级，async/await API，但功能相对简单
- **Enquirer** (2250万周下载): 快速加载（~4ms），仅一个依赖，ESLint/webpack/yarn 等知名项目使用

**代码示例**:
```typescript
import { select, input, confirm } from '@inquirer/prompts';

const action = await select({
  message: '请选择操作',
  choices: [
    { name: '启动服务', value: 'start' },
    { name: '停止服务', value: 'stop' },
    { name: '重启服务', value: 'restart' },
    { name: '查看状态', value: 'status' }
  ]
});

const port = await input({
  message: '请输入端口号',
  default: '443',
  validate: (value) => {
    const num = parseInt(value);
    return (num >= 1 && num <= 65535) || '端口号必须在 1-65535 之间';
  }
});

const shouldRestart = await confirm({
  message: '是否立即重启服务使配置生效？',
  default: true
});
```

---

### 1.2 命令行参数解析

**选择**: **Commander.js**

**理由**:
- **压倒性市场份额**: 2.12 亿周下载量，27,819 stars（几乎是 Yargs 的两倍）
- **声明式语法**: 清晰直观，适合分层子命令结构（如 git/npm）
- **零配置**: 开箱即用，配置开销最小
- **TypeScript 完美支持**: 内置类型定义
- **轻量**: ~208 KB 包大小

**备选方案**:
- **Yargs** (1.12亿周下载): 适合复杂选项验证和中间件需求，但配置更复杂

**代码示例**:
```typescript
import { program } from 'commander';

program
  .name('xray-manager')
  .description('Xray VPN 服务管理工具')
  .version('1.0.0');

program
  .command('service')
  .description('服务管理')
  .option('-a, --action <type>', '操作类型: start|stop|restart', 'start')
  .action(async (options) => {
    // 服务管理逻辑
  });

program
  .command('user')
  .description('用户管理')
  .option('-l, --list', '列出所有用户')
  .option('-a, --add <email>', '添加新用户')
  .option('-d, --delete <email>', '删除用户')
  .action(async (options) => {
    // 用户管理逻辑
  });

program.parse();
```

---

### 1.3 终端样式和进度显示

#### 颜色/样式: **Chalk 4.x**

**理由**:
- **行业标准**: 事实上的终端样式库
- **零依赖**: 无外部依赖，安全可靠
- **TypeScript 内置**: 完整类型定义
- **稳定性**: v4 为 CommonJS 项目提供最佳兼容性（v5 纯 ESM）

**版本选择说明**: 推荐 Chalk 4.x 而非 5.x，因为 v5 要求纯 ESM + TypeScript 4.7+，配置复杂度较高。v4 虽然 bundle 稍大，但兼容性更好。

**代码示例**:
```typescript
import chalk from 'chalk';

console.log(chalk.green('✓ 服务启动成功'));
console.log(chalk.red('✗ 端口 443 被占用'));
console.log(chalk.yellow('⚠ 警告：配置文件权限不正确'));
console.log(chalk.cyan('ℹ 提示：使用 sudo 运行以获得完整权限'));
```

#### 加载动画: **Ora**

**理由**:
- **最受欢迎**: 3400 万周下载，35,574+ 依赖项目
- **优雅的 API**: 简单直观，一行代码即可使用
- **与 Chalk 无缝集成**: 支持彩色 spinner 消息
- **轻量**: 26.87 KB 解压，7.32 KB 压缩

**备选方案**:
- **Listr2** (269 KB): 适合多任务并发进度显示，但体积较大
- **cli-progress**: 专注进度条，适合文件下载等场景

**代码示例**:
```typescript
import ora from 'ora';

const spinner = ora('正在下载 Xray 核心文件...').start();

try {
  await downloadXray();
  spinner.succeed('下载完成');
} catch (error) {
  spinner.fail('下载失败: ' + error.message);
}
```

#### 剪贴板操作: **Clipboardy**

**理由**:
- **最健壮**: 780 万周下载，跨平台兼容性最佳
- **全平台支持**: Windows / macOS / Linux（自动检测 Wayland/X11）
- **双 API**: 同时支持 async 和 sync API
- **Node.js 专用**: 专为 Node.js 环境设计（非浏览器）

**代码示例**:
```typescript
import clipboardy from 'clipboardy';

// 脱敏显示 UUID
const uuid = '1234abcd-5678-efgh-9012-ijklmnopqrst';
const masked = `${uuid.slice(0, 4)}...${uuid.slice(-4)}`; // "1234...qrst"

console.log(`UUID: ${masked}`);
console.log('按 [C] 复制完整 UUID 到剪贴板');

// 用户按 C 键时
await clipboardy.write(uuid);
console.log('✓ 已复制到剪贴板');
```

---

### 1.4 npm 全局包最佳实践

#### Shebang 声明
```typescript
#!/usr/bin/env node
// 使用环境变量中的 node 解释器，确保跨平台兼容
```

#### package.json 配置
```json
{
  "name": "xray-manager",
  "version": "1.0.0",
  "bin": {
    "xray-manager": "./dist/cli.js",
    "xm": "./dist/cli.js"
  },
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

#### TypeScript 配置
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "declaration": true,
    "module": "commonjs",
    "target": "ES2020"
  }
}
```

**重要提示**:
- 总是指向编译后的 `.js` 文件，而非 `.ts` 源码
- npm 会自动生成 Windows `.cmd` 包装器
- 本地测试使用 `npm link` 模拟全局安装
- 优先考虑本地安装而非全局安装（通过 `npm run` 执行）

---

### 1.5 学习曲线总结

**从易到难排序**:
1. **Chalk** - 立即可用，概念最简单
2. **Ora** - 单一 API 方法，极易上手
3. **Commander.js** - 声明式语法，直观易懂
4. **@inquirer/prompts** - 需要理解不同提示类型，但 API 清晰
5. **Yargs** - 高级特性多，学习曲线陡峭
6. **Listr2** - 最复杂，基于任务的架构

---

## 2. systemd 服务管理最佳实践

### 2.1 检测 systemd 可用性

**关键原则**: 始终先验证 systemd 是否可用，再执行任何 systemctl 操作。

**检测方法**:
```typescript
import { execFileSync } from 'child_process';
import { readlinkSync } from 'fs';

function isSystemdAvailable(): boolean {
  try {
    // 1. 检查 PID 1 是否为 systemd
    const pid1 = readlinkSync('/proc/1/exe');
    if (!pid1.includes('systemd')) {
      return false;
    }

    // 2. 验证 systemctl 命令存在
    execFileSync('which', ['systemctl'], { encoding: 'utf8' });

    // 3. 测试是否能与 systemd 通信
    execFileSync('systemctl', ['--version'], {
      encoding: 'utf8',
      timeout: 5000
    });

    return true;
  } catch {
    return false;
  }
}

// 使用示例
if (!isSystemdAvailable()) {
  console.error('错误：此系统未使用 systemd');
  console.error('本工具需要支持 systemd 的 Linux 发行版');
  process.exit(1);
}
```

---

### 2.2 安全执行 systemctl 命令

**关键原则**: 使用 `spawn()` 或 `execFile()` 而非 `exec()`，防止命令注入漏洞。

**选择 spawn() 的场景**:
- 实时输出流式传输
- 大量输出数据
- 长时间运行的进程
- 需要发送输入到进程

**选择 execFile() 的场景**:
- 简单命令，输出少
- 快速完成的操作
- 偏好基于 Promise 的 API

**代码实现**:
```typescript
import { spawn } from 'child_process';

interface SystemctlResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  success: boolean;
}

function systemctl(action: string, serviceName: string, options = {}): Promise<SystemctlResult> {
  return new Promise((resolve, reject) => {
    // 白名单验证：防止命令注入
    const validActions = ['start', 'stop', 'restart', 'status', 'enable',
                          'disable', 'is-active', 'is-enabled', 'show'];

    if (!validActions.includes(action)) {
      return reject(new Error(`无效操作: ${action}`));
    }

    // 服务名验证：仅允许字母数字、@、._-
    if (!/^[a-zA-Z0-9@._-]+$/.test(serviceName)) {
      return reject(new Error(`无效服务名: ${serviceName}`));
    }

    const args = [action, serviceName];
    const timeout = options.timeout || 30000; // 默认 30 秒超时

    const child = spawn('systemctl', args, {
      timeout,
      killSignal: 'SIGTERM',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(new Error(`执行 systemctl 失败: ${error.message}`));
    });

    child.on('close', (exitCode) => {
      resolve({
        exitCode,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        success: exitCode === 0
      });
    });
  });
}
```

**安全要点**:
- ❌ **永远不要使用 `exec()`** - 易受命令注入攻击
- ✅ **使用 `spawn()` 且 `shell: false`** (默认) - 无 shell 解释，安全
- ✅ **参数用数组传递** - 避免字符串拼接
- ✅ **白名单验证** - 仅允许预定义的操作和服务名
- ✅ **设置超时** - 防止进程挂起

---

### 2.3 权限检测和提升

**关键原则**: 提前检测权限问题，提供清晰指引；遵循最小权限原则（PoLP）。

**代码实现**:
```typescript
function isRoot(): boolean {
  return process.getuid && process.getuid() === 0;
}

function canUseSudo(): boolean {
  try {
    execFileSync('sudo', ['-n', 'true'], {
      timeout: 1000,
      stdio: 'ignore'
    });
    return true;
  } catch {
    return false;
  }
}

async function systemctlWithPrivileges(action: string, serviceName: string) {
  const needsPrivileges = ['start', 'stop', 'restart', 'enable',
                           'disable', 'daemon-reload'].includes(action);

  if (needsPrivileges && !isRoot()) {
    console.error('错误：此操作需要 root 权限');
    console.error(`请使用 sudo 运行: sudo ${process.argv.join(' ')}`);
    process.exit(1);
  }

  return systemctl(action, serviceName);
}
```

**安全要点**:
- 仅在必要操作时要求提权
- 不存储或传递 sudo 密码
- 考虑使用 PolicyKit/pkexec（GUI 应用）
- 在文档中说明 sudoers 配置（如需无密码执行）

---

### 2.4 错误处理和用户友好提示

**关键原则**: 解析 systemd 错误代码，提供可操作的建议。

**代码实现**:
```typescript
class SystemdError extends Error {
  constructor(
    message: string,
    public exitCode: number,
    public stderr: string,
    public suggestions: string[] = []
  ) {
    super(message);
    this.name = 'SystemdError';
  }
}

function parseSystemdError(action: string, serviceName: string, result: SystemctlResult): never {
  const { exitCode, stderr } = result;

  const errorPatterns = [
    {
      pattern: /Unit.*not found/i,
      message: `服务 '${serviceName}' 未找到`,
      suggestions: [
        `检查服务是否安装: systemctl list-unit-files | grep ${serviceName}`,
        '验证服务名称是否正确',
        '检查 Xray 是否安装: /usr/local/bin/xray --version'
      ]
    },
    {
      pattern: /Permission denied|Access denied/i,
      message: '权限被拒绝',
      suggestions: [
        `使用 root 权限运行: sudo ${process.argv[1]} ${action}`,
        '检查您的用户是否有 systemctl 访问权限'
      ]
    },
    {
      pattern: /port.*already in use/i,
      message: '端口已被占用',
      suggestions: [
        `检查占用端口的进程: sudo lsof -i :443`,
        '停止冲突的服务或修改端口配置'
      ]
    },
    {
      pattern: /failed to load.*config/i,
      message: '配置文件错误',
      suggestions: [
        `检查配置: /usr/local/etc/xray/config.json`,
        '验证 JSON 语法: cat config.json | python -m json.tool',
        '从备份恢复（如有）'
      ]
    }
  ];

  // 匹配错误模式
  for (const { pattern, message, suggestions } of errorPatterns) {
    if (pattern.test(stderr)) {
      throw new SystemdError(message, exitCode, stderr, suggestions);
    }
  }

  // 通用错误
  throw new SystemdError(
    `systemctl ${action} 失败`,
    exitCode,
    stderr,
    [`查看服务日志: journalctl -u ${serviceName} -n 50`]
  );
}

// 使用示例
async function systemctlSafe(action: string, serviceName: string) {
  try {
    const result = await systemctl(action, serviceName);

    if (!result.success) {
      parseSystemdError(action, serviceName, result);
    }

    return result;
  } catch (error) {
    if (error instanceof SystemdError) {
      console.error(`\n❌ ${error.message}`);
      if (error.stderr) {
        console.error(`\n详情: ${error.stderr}`);
      }
      if (error.suggestions.length > 0) {
        console.error(`\n💡 建议:`);
        error.suggestions.forEach((s, i) => {
          console.error(`   ${i + 1}. ${s}`);
        });
      }
    }
    throw error;
  }
}
```

---

### 2.5 优雅关闭策略（Graceful Shutdown）

**关键原则**: 实现优雅关闭，配置超时机制，等待活跃连接完成后再重启。

**需求对应**:
- **FR-016**: 重启服务时采用优雅关闭策略（10秒超时）
- **规范说明**: 预计中断时间 5-10 秒

**代码实现**:
```typescript
async function gracefulServiceRestart(serviceName: string, options = {}) {
  const drainTimeout = options.drainTimeout || 10000; // 10 秒（符合 FR-016）
  const forceTimeout = options.forceTimeout || 30000; // 30 秒最大超时

  console.log(`🔄 准备重启 ${serviceName}...`);
  console.log(`⏱️  预计中断时间: 5-10 秒`);
  console.log(`⏳ 等待活跃连接完成（超时: ${drainTimeout/1000}秒）...`);

  const startTime = Date.now();

  try {
    // 步骤 1: 发送 SIGTERM 允许优雅关闭
    await systemctl('stop', serviceName, {
      timeout: drainTimeout,
      noBlock: false
    });

    // 步骤 2: 等待确保干净停止
    await sleep(1000);

    // 步骤 3: 验证服务已停止
    const statusResult = await systemctl('is-active', serviceName, {
      timeout: 5000,
      quiet: true
    });

    if (statusResult.stdout === 'active') {
      console.log('⚠️  服务未优雅停止，强制停止中...');
      // 如果仍在运行，强制终止
      const { execFileSync } = require('child_process');
      execFileSync('pkill', ['-9', '-f', serviceName]);
      await sleep(2000);
    }

    // 步骤 4: 启动服务
    console.log('🚀 启动服务...');
    await systemctl('start', serviceName, {
      timeout: 15000
    });

    // 步骤 5: 验证服务运行中
    await sleep(2000);
    const verifyResult = await systemctl('is-active', serviceName, {
      timeout: 5000
    });

    if (verifyResult.stdout === 'active') {
      const downtime = Date.now() - startTime;
      console.log(`✅ 服务重启成功（中断时间: ${(downtime/1000).toFixed(1)}秒）`);
      return { success: true, downtime };
    } else {
      throw new Error('服务重启后启动失败');
    }

  } catch (error) {
    console.error('❌ 重启失败:', error.message);

    // 尝试紧急恢复
    console.log('🔧 尝试紧急恢复...');
    try {
      await systemctl('start', serviceName, { timeout: 10000 });
      console.log('✅ 恢复成功');
    } catch (recoveryError) {
      console.error('❌ 恢复失败 - 需要手动干预');
      throw recoveryError;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**要点**:
- 默认 10 秒超时（符合规范）
- 显示预计中断时间（5-10秒）
- 如果超时则强制终止
- 提供紧急恢复机制
- 记录实际中断时长

---

### 2.6 解析 systemd 状态输出

**关键原则**: 使用 `systemctl show` 获取机器可读格式，而非解析人类可读的 `systemctl status`。

**代码实现**:
```typescript
interface ServiceStatus {
  active: boolean;
  state: string;
  subState: string;
  loaded: boolean;
  pid: number | null;
  uptime: string;
  memory: string;
  restarts: number;
  result: string;
  healthy: boolean;
}

async function getServiceStatus(serviceName: string): Promise<ServiceStatus> {
  try {
    const properties = [
      'ActiveState',
      'SubState',
      'LoadState',
      'MainPID',
      'ExecMainStartTimestamp',
      'MemoryCurrent',
      'CPUUsageNSec',
      'NRestarts',
      'Result'
    ];

    const args = ['show', serviceName, `--property=${properties.join(',')}`];
    const { execFile } = require('child_process');
    const { promisify } = require('util');
    const execFileAsync = promisify(execFile);

    const result = await execFileAsync('systemctl', args, {
      timeout: 5000
    });

    // 解析 key=value 输出
    const status: any = {};
    result.stdout.split('\n').forEach((line: string) => {
      const [key, value] = line.split('=');
      if (key && value) {
        status[key] = value;
      }
    });

    return {
      active: status.ActiveState === 'active',
      state: status.ActiveState,
      subState: status.SubState,
      loaded: status.LoadState === 'loaded',
      pid: parseInt(status.MainPID) || null,
      uptime: calculateUptime(status.ExecMainStartTimestamp),
      memory: formatBytes(parseInt(status.MemoryCurrent)),
      restarts: parseInt(status.NRestarts) || 0,
      result: status.Result,
      healthy: status.ActiveState === 'active' && status.SubState === 'running'
    };

  } catch (error) {
    return {
      active: false,
      state: 'unknown',
      error: error.message
    } as any;
  }
}

function calculateUptime(timestamp: string): string {
  if (!timestamp || timestamp === '0') return 'N/A';

  const start = new Date(parseInt(timestamp) / 1000);
  const now = new Date();
  const diff = now.getTime() - start.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}天 ${hours}小时 ${minutes}分钟`;
  if (hours > 0) return `${hours}小时 ${minutes}分钟`;
  return `${minutes}分钟`;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
```

---

### 2.7 超时处理策略

**关键原则**: 总是设置超时，实现软超时（SIGTERM）和硬超时（SIGKILL）双层机制。

**不同操作的超时时间**:
```typescript
const OPERATION_TIMEOUTS = {
  'start':     { soft: 15000, hard: 30000 },  // 启动可能较慢
  'stop':      { soft: 10000, hard: 20000 },  // 优雅关闭
  'restart':   { soft: 25000, hard: 50000 },  // 停止 + 启动
  'status':    { soft: 5000,  hard: 10000 },  // 快速查询
  'is-active': { soft: 3000,  hard: 5000  }   // 非常快
};
```

---

### 2.8 推荐的 Xray Service Manager 封装类

**代码实现** (完整示例见研究报告原文，此处略)

关键方法:
- `checkSystemd()`: 初始化时检测 systemd
- `isRoot()`: 检查 root 权限
- `executeSystemctl()`: 安全执行 systemctl 命令
- `parseError()`: 解析错误并添加建议
- `start()` / `stop()` / `restart()`: 服务控制操作
- `isActive()`: 快速检查服务状态
- `getStatus()`: 获取详细状态信息

---

## 3. CLI 应用测试策略（TDD 优先）

### 3.1 测试框架选型

**选择**: **Vitest**

**理由**:
- **性能**: 比 Jest 快 10-20 倍（watch 模式），整体测试运行时间减少 30-70%
- **零配置 TypeScript**: 通过 esbuild 原生支持 TypeScript/ESM/JSX
- **现代架构**: 重用 Vite 开发服务器和 ESM 管道，占用资源更少
- **Jest 兼容**: API 兼容 Jest，可平滑迁移
- **并行执行**: 使用 worker 线程隔离测试并行运行
- **2026 改进**: Vitest 3 显著提升性能，优化快照处理，改善内存使用
- **CI/CD 友好**: 出色的错误消息，快速执行，内置 watch 模式

**配置示例**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['**/*.test.ts', '**/node_modules/**'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
})
```

**TDD 工作流**:
1. **Red**: 先写失败测试，运行 `npm run test:watch`
2. **Green**: Vitest watch 模式立即重新运行受影响的测试（智能重跑）
3. **Refactor**: 快速反馈循环（测试通常 <3 秒）支持自信重构
4. **Commit**: 提交前验证所有测试通过（RGRC 模式）

---

### 3.2 测试交互式提示和终端 I/O

#### 单元测试层（模拟提示）

**工具**: Vitest mocks

**策略**:
- stub `inquirer.prompt` 方法返回预设答案
- 快速、隔离、无需实际终端交互
- 完美测试围绕用户输入的业务逻辑

**代码示例**:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import inquirer from 'inquirer'
import { setupVPN } from './cli'

describe('VPN 配置 - 提示逻辑', () => {
  beforeEach(() => {
    vi.spyOn(inquirer, 'prompt').mockResolvedValue({
      protocol: 'VLESS',
      port: '443',
      enableTLS: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('当用户选择 VLESS 时应配置 TLS', async () => {
    const config = await setupVPN()

    expect(config.protocol).toBe('VLESS')
    expect(config.tls.enabled).toBe(true)
  })
})
```

#### 集成测试层（真实终端交互）

**工具**: `child_process` + 模拟 stdin

**策略**:
- 测试实际 CLI 二进制文件作为端到端工作流
- 验证提示流程、错误处理、输出格式
- 捕获单元测试遗漏的 TTY 相关问题

**代码示例**:
```typescript
import { describe, it, expect } from 'vitest'
import { spawn } from 'child_process'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

describe('CLI 集成 - 交互式提示', () => {
  it('应处理方向键和回车选择菜单', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'xray-test-'))

    const child = spawn('node', ['./bin/xray-vpn'], {
      cwd: tempDir,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    // 模拟用户输入: 下箭头, 回车
    child.stdin.write('\x1B[B\r')

    const output = await new Promise((resolve) => {
      let data = ''
      child.stdout.on('data', (chunk) => data += chunk)
      child.on('close', () => resolve(data))
    })

    expect(output).toContain('正在安装 VLESS 协议')

    await rm(tempDir, { recursive: true })
  })
})
```

---

### 3.3 模拟 child_process 执行 systemd 命令

**策略**: 使用 Vitest mocks + EventEmitter 模拟进程

**理由**:
- `child_process` 返回带有 stdin/stdout/stderr 流的 EventEmitter
- 创建假 EventEmitter 实例即可模拟
- 避免测试时实际调用 systemd（CI/CD 关键）
- 允许测试错误场景（命令失败、超时）

**代码示例**:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { EventEmitter } from 'events'
import * as cp from 'child_process'
import { startSystemdService } from './systemd-manager'

describe('Systemd 命令执行', () => {
  it('应成功启动 xray 服务', async () => {
    // 创建假进程
    const fakeProcess = new EventEmitter() as any
    fakeProcess.stdout = new EventEmitter()
    fakeProcess.stderr = new EventEmitter()

    // 模拟 spawn 返回假进程
    vi.spyOn(cp, 'spawn').mockReturnValue(fakeProcess)

    // 执行被测函数
    const promise = startSystemdService('xray')

    // 模拟成功执行
    fakeProcess.stdout.emit('data', 'Service started\n')
    fakeProcess.emit('close', 0)

    await expect(promise).resolves.toEqual({
      success: true,
      output: 'Service started\n'
    })

    expect(cp.spawn).toHaveBeenCalledWith('systemctl', ['start', 'xray'])
  })

  it('应优雅处理 systemd 失败', async () => {
    const fakeProcess = new EventEmitter() as any
    fakeProcess.stdout = new EventEmitter()
    fakeProcess.stderr = new EventEmitter()

    vi.spyOn(cp, 'spawn').mockReturnValue(fakeProcess)

    const promise = startSystemdService('xray')

    // 模拟失败
    fakeProcess.stderr.emit('data', 'Failed to start service\n')
    fakeProcess.emit('close', 1)

    await expect(promise).rejects.toThrow('Failed to start service')
  })
})
```

---

### 3.4 CLI 工作流集成测试策略

**策略**: 子进程执行 + 临时目录 + 真实二进制测试

**理由**:
- 唯一能捕获 OS 级问题、PATH 问题、运行时错误的方式
- 验证从二进制入口点到最终输出的完整工作流
- 跨不同 Node.js 版本和平台（Linux/macOS/Windows）测试

**代码示例**:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, readFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { spawn } from 'child_process'

describe('Xray VPN CLI - 端到端工作流', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'xray-e2e-'))
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true })
  })

  it('应安装、配置、启动 Xray 服务', async () => {
    const child = spawn('node', ['./bin/xray-vpn', 'install'], {
      cwd: testDir,
      env: { ...process.env, XRAY_TEST_MODE: 'true' }
    })

    let output = ''
    child.stdout.on('data', (chunk) => output += chunk.toString())

    const exitCode = await new Promise((resolve) => {
      child.on('close', resolve)
    })

    expect(exitCode).toBe(0)
    expect(output).toContain('安装完成')

    // 验证生成的配置文件
    const configPath = join(testDir, 'config.json')
    const config = JSON.parse(await readFile(configPath, 'utf-8'))
    expect(config.protocol).toBeDefined()
  })
})
```

---

### 3.5 测试隔离和避免系统副作用

**策略**: 依赖注入 + 测试模式标志 + 全面模拟

**理由**:
- 防止测试修改真实系统（安装包、修改 systemd）
- 实现确定性、可重复的测试
- 允许并行测试执行无冲突
- 快速测试执行（无实际网络/磁盘/系统操作）

#### 策略 1: 基于环境的测试模式
```typescript
// systemd-manager.ts
export class SystemdManager {
  private isTestMode = process.env.NODE_ENV === 'test'

  async startService(name: string): Promise<void> {
    if (this.isTestMode) {
      console.log(`[测试模式] 将启动服务: ${name}`)
      return
    }

    return this.actualStartService(name)
  }

  private async actualStartService(name: string): Promise<void> {
    // 真实实现
  }
}
```

#### 策略 2: 依赖注入
```typescript
export interface FileSystem {
  writeFile(path: string, content: string): Promise<void>
  readFile(path: string): Promise<string>
}

export class ConfigManager {
  constructor(private fs: FileSystem) {}

  async saveConfig(config: XrayConfig): Promise<void> {
    await this.fs.writeFile('/etc/xray/config.json', JSON.stringify(config))
  }
}

// 测试中注入模拟文件系统
describe('ConfigManager', () => {
  it('应保存配置而不触及真实文件系统', async () => {
    const mockFS = {
      writeFile: vi.fn().mockResolvedValue(undefined),
      readFile: vi.fn()
    }

    const manager = new ConfigManager(mockFS)
    await manager.saveConfig({ protocol: 'VLESS' })

    expect(mockFS.writeFile).toHaveBeenCalledWith(
      '/etc/xray/config.json',
      expect.stringContaining('VLESS')
    )
  })
})
```

#### 策略 3: 测试夹具和沙箱
```typescript
describe('文件操作', () => {
  let sandbox: string

  beforeEach(async () => {
    sandbox = await mkdtemp(join(tmpdir(), 'test-'))
  })

  afterEach(async () => {
    await rm(sandbox, { recursive: true, force: true })
  })

  it('应仅在沙箱中创建配置', async () => {
    const configPath = join(sandbox, 'config.json')
    await createConfig(configPath)
    // 断言：文件在沙箱中，而非真实系统
  })
})
```

**好处**:
- 测试运行时间毫秒级（无 I/O 开销）
- 并行执行安全（无共享状态）
- 确定性结果（无网络/磁盘不稳定）
- CI/CD 友好（无需 sudo/root 权限）

---

### 3.6 代码覆盖率工具

**选择**: **c8** (原生 V8 覆盖率) 或 **Vitest 内置覆盖率**

**理由**:
- **c8**: 使用 V8 原生覆盖率数据（无插桩开销）
- **Source map 支持**: 自动处理 TypeScript → JavaScript 映射
- **快速**: 无需代码转换
- **准确**: 基于执行的覆盖率（非语句级）
- **现代**: 积极维护，支持 ESM
- **Node.js 原生选项**: 内置 `--experimental-test-coverage` 标志（Node 16+）

**Vitest 配置**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**'
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
})
```

**package.json 脚本**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**最佳实践**:
1. **设置现实阈值**: 从 70-80% 开始，逐步提高
2. **排除生成代码**: 测试文件、构建产物、node_modules
3. **使用 `--exclude-after-remap`**: 对于有 source map 的 TypeScript 项目
4. **跟踪趋势**: 使用 LCOV 报告在 CI 中跟踪覆盖率趋势
5. **专注关键路径**: 不必追求 100% 覆盖；专注业务逻辑
6. **分支覆盖很重要**: 确保错误路径被测试
7. **CI 集成**: 如果覆盖率低于阈值则失败构建

---

### 3.7 完整 TDD 工作流（RGRC 循环）

**推荐循环**: RGRC (Red-Green-Refactor-Commit)

```bash
# 终端 1: 始终运行 watch 模式
npm run test:watch

# 终端 2: 开发
```

**步骤流程**:

1. **RED - 先写失败测试**
   ```typescript
   describe('Xray 安装', () => {
     it('应安装 Xray 二进制到 /usr/local/bin', async () => {
       const result = await installXray()
       expect(result.path).toBe('/usr/local/bin/xray')
       expect(result.version).toMatch(/^v\d+\.\d+\.\d+$/)
     })
   })
   ```
   - 测试立即失败（函数不存在）
   - Vitest watch 模式 <1 秒内显示失败

2. **GREEN - 最小实现**
   ```typescript
   export async function installXray() {
     return {
       path: '/usr/local/bin/xray',
       version: 'v1.8.0'
     }
   }
   ```
   - 测试通过
   - 不要马上实现完整逻辑 - 只需通过测试

3. **REFACTOR - 改进代码质量**
   ```typescript
   import { downloadBinary } from './downloader'
   import { getLatestVersion } from './version-checker'

   export async function installXray() {
     const version = await getLatestVersion()
     const installPath = '/usr/local/bin/xray'

     await downloadBinary(version, installPath)

     return { path: installPath, version }
   }
   ```
   - 提取职责
   - 测试仍然通过
   - Watch 模式确认无回归

4. **COMMIT - 保存进度**
   ```bash
   git add cli.ts cli.test.ts
   git commit -m "feat: 实现 Xray 安装及版本检测"
   ```

5. **REPEAT - 下一个功能**
   - 编写下一个测试（如错误处理）
   - 回到 RED 阶段

---

## 4. 推荐技术栈总结（2026）

| 类别 | 工具 | 为何选择 |
|------|------|---------|
| **测试框架** | Vitest | 快 10-20 倍，原生 TypeScript，零配置 |
| **提示测试** | Vitest mocks + child_process | 单元（stub）+ 集成（真实）双层策略 |
| **进程模拟** | Vitest mocks + EventEmitter | 原生，灵活，无额外依赖 |
| **集成测试** | spawn + 临时目录 | 端到端验证，跨平台测试 |
| **测试隔离** | DI + 测试模式标志 | 无系统副作用，快速，并行安全 |
| **覆盖率** | c8 via Vitest | 原生 V8 覆盖率，快速，准确 |
| **交互菜单** | @inquirer/prompts | 市场主导，TypeScript 原生，功能最全 |
| **参数解析** | Commander.js | 2.12 亿周下载，声明式语法，轻量 |
| **终端样式** | Chalk 4.x | 行业标准，零依赖，TypeScript 内置 |
| **加载动画** | Ora | 3400 万周下载，优雅 API，轻量 |
| **剪贴板** | Clipboardy | 跨平台最佳，780 万周下载 |
| **systemd 管理** | child_process.spawn() | 安全（防注入），实时输出，超时控制 |
| **CI/CD** | GitHub Actions matrix | 多 OS/Node 测试，覆盖率跟踪 |

---

## 5. 项目结构推荐

```
xray-manager/
├── src/
│   ├── cli.ts                 # CLI 入口点
│   ├── commands/
│   │   ├── install.ts         # 安装命令
│   │   ├── service.ts         # 服务管理命令
│   │   ├── user.ts            # 用户管理命令
│   │   ├── config.ts          # 配置管理命令
│   │   └── logs.ts            # 日志查看命令
│   ├── services/
│   │   ├── systemd-manager.ts # systemd 封装类
│   │   ├── config-manager.ts  # 配置文件管理
│   │   ├── user-manager.ts    # 用户管理逻辑
│   │   └── downloader.ts      # Xray 核心下载
│   ├── utils/
│   │   ├── prompt.ts          # 提示工具函数
│   │   ├── logger.ts          # 日志工具
│   │   ├── validator.ts       # 输入验证
│   │   └── clipboard.ts       # 剪贴板操作
│   └── types/
│       ├── config.ts          # 配置类型定义
│       └── service.ts         # 服务类型定义
├── tests/
│   ├── unit/
│   │   ├── commands/
│   │   │   ├── service.test.ts
│   │   │   ├── user.test.ts
│   │   │   └── config.test.ts
│   │   └── services/
│   │       ├── systemd-manager.test.ts
│   │       ├── config-manager.test.ts
│   │       └── user-manager.test.ts
│   ├── integration/
│   │   ├── cli-workflow.test.ts
│   │   ├── service-lifecycle.test.ts
│   │   └── user-management.test.ts
│   └── fixtures/
│       ├── mock-config.json
│       ├── mock-users.json
│       └── mock-responses.ts
├── bin/
│   └── xray-manager.js        # 全局命令入口（编译后）
├── vitest.config.ts           # Vitest 配置
├── tsconfig.json              # TypeScript 配置
└── package.json               # 包配置
```

---

## 6. 完整安装配置

**安装依赖**:
```bash
# 生产依赖
npm install @inquirer/prompts commander chalk@4 ora clipboardy

# 开发依赖
npm install -D vitest @vitest/ui c8 typescript @types/node
```

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
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config'

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
})
```

**package.json**:
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
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "lint": "eslint src tests",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["xray", "vpn", "cli", "systemd"],
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 7. 宪章合规性检查

根据 `.specify/memory/constitution.md`：

### ✅ I. 安全第一
- **选择 spawn() 而非 exec()**: 防止命令注入漏洞 (CR-001)
- **输入验证白名单**: 服务名和操作参数严格验证
- **敏感信息脱敏**: 使用 Clipboardy 实现复制功能，避免屏幕泄露 (CR-001)
- **配置文件权限**: 代码中验证和设置 600 权限

### ✅ II. 简洁易用
- **交互式菜单**: @inquirer/prompts 提供直观界面 (CR-002)
- **友好错误提示**: SystemdError 类提供双语错误和建议
- **零配置启动**: 全局安装后即可使用 `xray-manager` 或 `xm`

### ✅ III. 可靠稳定
- **systemd 可用性检测**: 启动时检查并提供明确错误 (CR-003)
- **自动备份**: ConfigManager 在修改前备份配置
- **超时和重试**: 所有 systemctl 操作设置超时
- **优雅关闭**: 10 秒超时的 graceful shutdown 策略 (FR-016)

### ✅ IV. 测试优先（强制性）
- **TDD 工具链**: Vitest + c8 覆盖率 + watch 模式 (CR-004)
- **RGRC 循环**: 红-绿-重构-提交工作流
- **多层测试**: 单元测试 + 集成测试 + 端到端测试
- **测试隔离**: DI 模式和测试模式标志防止副作用

### ✅ V. 文档完整
- **代码注释**: 所有公共 API 包含 TSDoc 注释 (CR-005)
- **README 更新**: 需要在实施阶段更新安装和使用说明
- **类型定义**: TypeScript 提供自文档化的类型系统
- **双语支持**: 错误消息和提示支持中英文

---

## 8. 下一步行动

1. **Phase 1**: 生成 `data-model.md` 定义实体和数据结构
2. **Phase 1**: 生成 `contracts/` 目录定义 CLI 命令接口
3. **Phase 1**: 生成 `quickstart.md` 开发者快速上手指南
4. **Phase 2**: 完善 `plan.md` Technical Context 部分
5. **Phase 2**: 执行 Constitution Check 验证
6. **Phase 2**: 生成 `tasks.md` 可执行任务列表

---

## 附录：参考资源

### CLI 框架
- [Inquirer.js GitHub](https://github.com/SBoudrias/Inquirer.js)
- [@inquirer/prompts npm](https://www.npmjs.com/package/@inquirer/prompts)
- [Commander.js 官方文档](https://github.com/tj/commander.js)
- [Chalk npm 包](https://www.npmjs.com/package/chalk)
- [Ora npm 包](https://www.npmjs.com/package/ora)
- [Clipboardy npm 包](https://www.npmjs.com/package/clipboardy)

### systemd 管理
- [Node.js 官方文档 - child_process](https://nodejs.org/api/child_process.html)
- [Running Node.js on Linux with systemd](https://www.cloudbees.com/blog/running-node-js-linux-systemd)
- [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices)

### 测试策略
- [Vitest 官方文档](https://vitest.dev/)
- [c8 npm 包](https://www.npmjs.com/package/c8)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodejs-testing-best-practices)
- [Vitest vs Jest Comparison](https://vitest.dev/guide/comparisons)

---

**报告生成时间**: 2026-01-07
**研究任务数**: 3 (CLI 框架 + systemd 管理 + 测试策略)
**技术栈确定**: ✅ 已完成
**宪章合规**: ✅ 已验证
**状态**: Ready for Phase 1
