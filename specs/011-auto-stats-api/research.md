# Research: 自动启用 Xray Stats API

**Feature**: 011-auto-stats-api
**Date**: 2026-01-14

## 1. Xray Stats API 配置结构

### Decision: 使用标准 Xray Stats API 配置

### Rationale
Xray 官方文档定义了启用流量统计所需的配置结构，包括三个必要组件：

1. **stats 配置块** - 启用统计功能
2. **api 配置块** - 定义可用的 API 服务
3. **api inbound** - 提供 gRPC 接口访问统计数据
4. **routing 规则** - 将 API 流量路由到 api handler

### 完整配置示例

```json
{
  "stats": {},
  "api": {
    "tag": "api",
    "services": ["StatsService"]
  },
  "inbounds": [
    {
      "tag": "api",
      "port": 10085,
      "listen": "127.0.0.1",
      "protocol": "dokodemo-door",
      "settings": {
        "address": "127.0.0.1"
      }
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "inboundTag": ["api"],
        "outboundTag": "api"
      }
    ]
  }
}
```

### Alternatives Considered
- **使用 HTTP API**: 不支持，Xray Stats 仅支持 gRPC
- **使用外部端口**: 安全风险，选择仅监听 127.0.0.1

---

## 2. 配置合并策略

### Decision: 智能合并而非覆盖

### Rationale
用户现有配置可能已包含部分 stats 相关配置，需要智能检测和补全：

1. **检测现有配置**:
   - `config.stats` 是否存在
   - `config.api` 是否存在且包含 StatsService
   - `config.inbounds` 是否包含 api tag 的 inbound
   - `config.routing.rules` 是否包含 api 路由规则

2. **合并规则**:
   - 如果 `stats` 不存在，添加 `"stats": {}`
   - 如果 `api` 不存在，添加完整 api 配置
   - 如果 `api` 存在但缺少 StatsService，添加到 services 数组
   - 如果缺少 api inbound，添加到 inbounds 数组
   - 如果缺少 api 路由规则，添加到 routing.rules 数组

### Alternatives Considered
- **完全覆盖**: 可能破坏用户自定义配置
- **仅添加缺失项**: 选择此方案，最小化修改

---

## 3. 端口选择策略

### Decision: 默认 10085，支持自动检测冲突

### Rationale
- 10085 是 Xray 社区常用的 Stats API 端口
- 需要检测端口是否被占用
- 如果冲突，自动选择下一个可用端口 (10086, 10087...)

### 端口检测方法
```typescript
// 使用 net 模块检测端口可用性
import { createServer } from 'net';

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}
```

### Alternatives Considered
- **固定端口**: 可能与其他服务冲突
- **用户指定**: 增加复杂度，作为高级选项保留

---

## 4. 服务重启策略

### Decision: 使用 systemctl restart 并验证状态

### Rationale
现有 `SystemdManager` 已提供服务控制功能：

```typescript
// 现有方法
await systemdManager.restart(); // 重启服务
await systemdManager.isActive(); // 检查状态
```

### 重启流程
1. 备份配置
2. 写入新配置
3. 执行 `systemctl restart xray`
4. 等待 2 秒
5. 检查服务状态 (`systemctl is-active xray`)
6. 验证 Stats API 可连接
7. 如果失败，恢复备份并重启

### Alternatives Considered
- **reload**: Xray 不支持配置热重载
- **手动重启提示**: 用户体验差

---

## 5. 回滚机制

### Decision: 复用 ConfigManager 备份/恢复功能

### Rationale
`ConfigManager` 已实现完整的备份恢复机制：

```typescript
// 现有方法
const backupPath = await configManager.backupConfig();
await configManager.restoreConfig(backupPath);
```

### 回滚触发条件
1. 配置写入失败
2. 服务重启失败 (systemctl restart 返回非零)
3. 服务启动后 Stats API 无法连接
4. 用户手动取消

### Alternatives Considered
- **新建备份系统**: 重复造轮子
- **不备份**: 风险太高

---

## 6. 用户交互流程

### Decision: 检测到问题时提示，确认后自动配置

### Rationale
遵循现有 UI 模式，使用 `@inquirer/prompts`:

```typescript
// 检测到 Stats API 未启用时
const shouldConfigure = await confirm({
  message: 'Stats API 未启用，是否自动配置？',
  default: true,
});

if (shouldConfigure) {
  const spinner = ora('正在配置 Stats API...').start();
  // ... 配置流程
  spinner.succeed('Stats API 配置成功！');
}
```

### 交互点
1. **流量详情页**: 检测到不可用时提示
2. **配额列表页**: 检测到不可用时提示
3. **菜单选项**: 主动配置入口

### Alternatives Considered
- **静默配置**: 用户可能不知道发生了什么
- **仅提示不配置**: 用户体验差

---

## 7. 类型定义扩展

### Decision: 扩展现有 XrayConfig 类型

### 需要添加的类型

```typescript
// src/types/config.ts 扩展

/** Stats 配置 */
export interface StatsConfig {
  // 空对象即可启用
}

/** API 配置 */
export interface ApiConfig {
  tag: string;
  services: ('StatsService' | 'HandlerService' | 'LoggerService' | 'RoutingService')[];
}

/** Dokodemo-door 入站配置 (用于 API) */
export interface DokodemoInbound extends Omit<Inbound, 'protocol' | 'settings'> {
  protocol: 'dokodemo-door';
  settings: {
    address: string;
  };
}

// 扩展 XrayConfig
export interface XrayConfig {
  // ... 现有字段
  stats?: StatsConfig;
  api?: ApiConfig;
}
```

---

## 8. 错误处理策略

### Decision: 分层错误处理，提供具体建议

### 错误类型和处理

| 错误类型 | 检测方法 | 用户提示 |
|---------|---------|---------|
| 配置文件不存在 | ENOENT | "配置文件不存在，请检查 Xray 安装" |
| 权限不足 | EACCES | "需要 root 权限，请使用 sudo 运行" |
| JSON 格式错误 | SyntaxError | "配置文件格式错误: {具体位置}" |
| 端口被占用 | 端口检测 | "端口 10085 被占用，将使用 10086" |
| 服务重启失败 | systemctl 返回码 | "服务重启失败，已恢复原配置" |
| API 连接失败 | xray api 命令 | "API 配置成功但连接失败，请检查防火墙" |

---

## Summary

所有技术决策已明确，无需进一步澄清。关键设计点：

1. **配置合并**: 智能检测和补全，最小化修改
2. **端口管理**: 默认 10085，自动检测冲突
3. **服务控制**: 复用 SystemdManager
4. **备份恢复**: 复用 ConfigManager
5. **用户交互**: 遵循现有 UI 模式
6. **错误处理**: 分层处理，提供具体建议
