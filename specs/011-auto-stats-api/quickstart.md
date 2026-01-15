# Quickstart: 自动启用 Xray Stats API

**Feature**: 011-auto-stats-api
**Date**: 2026-01-14

## 概述

本功能为 Xray Manager CLI 添加自动配置 Stats API 的能力，使流量统计功能开箱即用。

## 用户使用流程

### 场景 1: 查看流量时自动提示

```bash
$ sudo xray-manager

# 进入流量配额管理 > 查看配额详情
# 系统检测到 Stats API 未启用，显示提示：

┌─────────────────────────────────────────────────────┐
│  ⚠️  流量统计功能未启用                              │
│                                                     │
│  Xray 配置中未启用 Stats API，无法获取流量数据。      │
│                                                     │
│  是否自动配置 Stats API？                            │
│  > 是，自动配置 (推荐)                               │
│    否，稍后手动配置                                  │
└─────────────────────────────────────────────────────┘

# 选择"是"后：
✔ 正在备份配置... 完成
✔ 正在添加 Stats API 配置... 完成
✔ 正在重启 Xray 服务... 完成
✔ 正在验证 API 连接... 完成

✅ Stats API 配置成功！
   API 端口: 10085
   备份文件: /var/backups/xray/config.2026-01-14T10-30-00.000Z.json

# 现在可以正常查看流量统计
```

### 场景 2: 主动配置 Stats API

```bash
$ sudo xray-manager

# 主菜单 > 流量配额管理 > 配置 Stats API

┌─────────────────────────────────────────────────────┐
│  📊 Stats API 配置                                   │
│                                                     │
│  当前状态: 未配置                                    │
│                                                     │
│  配置 Stats API 后，您可以：                         │
│  • 查看用户实时流量使用情况                          │
│  • 设置流量配额并自动限制                            │
│  • 查看流量统计报表                                  │
│                                                     │
│  是否立即配置？                                      │
│  > 是，立即配置                                      │
│    否，返回                                          │
└─────────────────────────────────────────────────────┘
```

### 场景 3: 配置失败自动回滚

```bash
# 如果配置过程中出现错误：

✔ 正在备份配置... 完成
✔ 正在添加 Stats API 配置... 完成
✖ 正在重启 Xray 服务... 失败

⚠️  服务重启失败，正在恢复原配置...
✔ 配置已恢复

❌ Stats API 配置失败
   原因: Xray 服务启动失败，请检查配置文件
   备份文件: /var/backups/xray/config.2026-01-14T10-30-00.000Z.json

   您可以手动恢复: sudo cp /var/backups/xray/config.2026-01-14T10-30-00.000Z.json /usr/local/etc/xray/config.json
```

## 开发者快速开始

### 1. 使用 StatsConfigManager

```typescript
import { StatsConfigManager } from './services/stats-config-manager';

const manager = new StatsConfigManager();

// 检测 Stats API 状态
const detection = await manager.detectStatsConfig();
console.log(detection.available);        // false
console.log(detection.missingComponents); // ['stats', 'api', 'api-inbound', 'api-routing']

// 自动配置
if (!detection.available) {
  const result = await manager.enableStatsApi();
  if (result.success) {
    console.log(`配置成功，API 端口: ${result.apiPort}`);
  } else {
    console.log(`配置失败: ${result.error}`);
    console.log(`已回滚: ${result.rolledBack}`);
  }
}
```

### 2. 集成到命令处理

```typescript
import { StatsConfigManager } from '../services/stats-config-manager';
import { confirm } from '@inquirer/prompts';
import ora from 'ora';

async function ensureStatsApiEnabled(): Promise<boolean> {
  const manager = new StatsConfigManager();
  const detection = await manager.detectStatsConfig();

  if (detection.available) {
    return true;
  }

  // 提示用户
  const shouldConfigure = await confirm({
    message: 'Stats API 未启用，是否自动配置？',
    default: true,
  });

  if (!shouldConfigure) {
    return false;
  }

  // 执行配置
  const spinner = ora('正在配置 Stats API...').start();
  const result = await manager.enableStatsApi();

  if (result.success) {
    spinner.succeed(`Stats API 配置成功！端口: ${result.apiPort}`);
    return true;
  } else {
    spinner.fail(`配置失败: ${result.error}`);
    return false;
  }
}
```

### 3. 运行测试

```bash
# 运行单元测试
npm test -- tests/unit/services/stats-config-manager.test.ts

# 运行集成测试 (需要 root 权限和 Xray 环境)
sudo npm test -- tests/integration/stats-api-setup.test.ts

# 运行所有测试
npm test
```

## 配置文件变更示例

### 配置前

```json
{
  "log": { "loglevel": "warning" },
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": { ... }
    }
  ],
  "outbounds": [
    { "protocol": "freedom", "tag": "direct" }
  ]
}
```

### 配置后

```json
{
  "log": { "loglevel": "warning" },
  "stats": {},
  "api": {
    "tag": "api",
    "services": ["StatsService"]
  },
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": { ... }
    },
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
  "outbounds": [
    { "protocol": "freedom", "tag": "direct" }
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

## 验证配置

```bash
# 检查服务状态
systemctl status xray

# 测试 Stats API
xray api statsquery --server=127.0.0.1:10085

# 查看用户流量
xray api stats --server=127.0.0.1:10085 -name "user>>>user@example.com>>>traffic>>>uplink"
```

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 权限不足 | 未使用 root 运行 | `sudo xray-manager` |
| 端口被占用 | 10085 已被使用 | 系统会自动选择下一个可用端口 |
| 服务重启失败 | 配置语法错误 | 检查备份文件，手动恢复 |
| API 连接失败 | 防火墙阻止 | 检查 iptables/firewalld 规则 |
