# Contract: 服务管理命令

**命令**: `xray-manager service <subcommand>`
**别名**: `xm service <subcommand>`
**用户故事**: [US2 - 交互式服务状态查看和控制](../spec.md#user-story-2---交互式服务状态查看和控制-priority-p1)

---

## Subcommands (子命令)

| 子命令 | 描述 | 权限要求 |
|--------|------|----------|
| `start` | 启动服务 | root |
| `stop` | 停止服务 | root |
| `restart` | 重启服务（优雅关闭） | root |
| `status` | 查看服务状态 | 普通用户 |
| `enable` | 启用开机自启 | root |
| `disable` | 禁用开机自启 | root |

---

## 1. service start

### Usage
```bash
xray-manager service start [options]
xm service start
```

### Parameters
| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--service <name>` | string | 服务名称 | `xray` |
| `--timeout <ms>` | number | 超时时间（毫秒） | `15000` |
| `--json` | boolean | JSON 格式输出 | `false` |

### Output (标准格式)
```
🚀 启动服务: xray
⏳ 正在启动...
✅ 服务启动成功

服务地址: https://0.0.0.0:443
运行时长: 刚刚启动
进程 ID:  12345
```

### Output (JSON 格式)
```json
{
  "success": true,
  "operation": "start",
  "serviceName": "xray",
  "data": {
    "pid": 12345,
    "port": 443,
    "uptime": "0s"
  },
  "duration": 1234,
  "timestamp": "2026-01-07T10:30:45.123Z"
}
```

### Exit Codes
- `0`: 成功启动
- `4`: 权限不足
- `5`: 服务已在运行或启动失败

### Error Example
```
❌ 服务启动失败: 端口 443 已被占用

💡 建议:
   1. 检查占用端口的进程: sudo lsof -i :443
   2. 停止冲突的服务或修改端口配置
   3. 查看服务日志: journalctl -u xray -n 50

退出代码: 5
```

---

## 2. service stop

### Usage
```bash
xray-manager service stop [options]
xm service stop
```

### Parameters
| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--service <name>` | string | 服务名称 | `xray` |
| `--timeout <ms>` | number | 超时时间（毫秒） | `10000` |
| `--force` | boolean | 强制停止（SIGKILL） | `false` |
| `--json` | boolean | JSON 格式输出 | `false` |

### Output (标准格式)
```
🛑 停止服务: xray
⏳ 正在停止...
✅ 服务停止成功

停止前运行时长: 2天 3小时 15分钟
```

### Behavior
- 默认发送 SIGTERM 信号（优雅关闭）
- 如果 10 秒内未停止，自动发送 SIGKILL
- 使用 `--force` 立即发送 SIGKILL

### Exit Codes
- `0`: 成功停止
- `4`: 权限不足
- `5`: 服务未运行或停止失败

---

## 3. service restart (关键操作)

### Usage
```bash
xray-manager service restart [options]
xm service restart
```

### Parameters
| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--service <name>` | string | 服务名称 | `xray` |
| `--graceful-timeout <ms>` | number | 优雅关闭超时 | `10000` |
| `--no-confirm` | boolean | 跳过确认提示 | `false` |
| `--json` | boolean | JSON 格式输出 | `false` |

### Output (标准格式 - 符合 FR-016)
```
🔄 准备重启服务: xray
⏱️  预计中断时间: 5-10 秒

⚠️  重启将中断所有活跃连接，确定继续吗? (y/N) y

⏳ 等待活跃连接完成（超时: 10 秒）...
🛑 停止服务...
✅ 服务已停止

⏳ 等待 1 秒...
🚀 启动服务...
✅ 服务已启动

✅ 服务重启成功
   实际中断时间: 6.2 秒
```

### Behavior (优雅关闭策略)
1. **步骤 1**: 发送 SIGTERM，等待现有连接完成（10 秒超时）
2. **步骤 2**: 如果超时，强制发送 SIGKILL
3. **步骤 3**: 等待 1 秒确保完全停止
4. **步骤 4**: 启动服务
5. **步骤 5**: 验证服务运行状态
6. **步骤 6**: 报告实际中断时间

### Output (JSON 格式)
```json
{
  "success": true,
  "operation": "restart",
  "serviceName": "xray",
  "data": {
    "downtime": 6200,
    "graceful": true,
    "activeConnectionsWaited": true
  },
  "duration": 12345,
  "timestamp": "2026-01-07T10:30:45.123Z"
}
```

### Exit Codes
- `0`: 成功重启
- `4`: 权限不足
- `5`: 重启失败（服务未启动或启动失败）

### Error Example
```
❌ 服务重启失败: 服务重启后启动失败

💡 建议:
   1. 查看服务日志: journalctl -u xray -n 50
   2. 验证配置文件: xray-manager config validate
   3. 尝试手动启动: xray-manager service start

🔧 尝试紧急恢复...
✅ 服务已恢复运行

退出代码: 5
```

---

## 4. service status

### Usage
```bash
xray-manager service status [options]
xm service status
```

### Parameters
| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--service <name>` | string | 服务名称 | `xray` |
| `--logs <n>` | number | 显示最近 N 条日志 | `10` |
| `--json` | boolean | JSON 格式输出 | `false` |

### Output (标准格式 - 符合 FR-004)
```
╔═══════════════════════════════════════════════════════════╗
║                  Xray 服务状态                            ║
╚═══════════════════════════════════════════════════════════╝

服务名称: xray
状态:     🟢 运行中 (active)
子状态:   running
进程 ID:  12345
监听端口: 443
运行时长: 2天 3小时 15分钟
内存占用: 45.2 MB
CPU 使用: 2.3%
重启次数: 0
最后结果: success
开机自启: 已启用

最近日志 (最后 10 条):
  [2026-01-07 10:28:15] Xray 1.8.7 started
  [2026-01-07 10:28:15] VLESS inbound listening on :443
  [2026-01-07 10:28:20] New connection from 192.168.1.100
  [2026-01-07 10:29:30] Connection closed (duration: 70s, bytes: 1.2MB)
  [2026-01-07 10:30:00] Active connections: 3
  [2026-01-07 10:30:15] New connection from 192.168.1.105
  [2026-01-07 10:30:45] Memory usage: 45.2 MB
  [2026-01-07 10:31:00] Active connections: 4
  [2026-01-07 10:31:30] Connection closed (duration: 90s, bytes: 2.3MB)
  [2026-01-07 10:32:00] Active connections: 3
```

### Output (JSON 格式)
```json
{
  "success": true,
  "serviceName": "xray",
  "data": {
    "active": true,
    "activeState": "active",
    "subState": "running",
    "loaded": true,
    "pid": 12345,
    "uptime": "2天 3小时 15分钟",
    "uptimeSeconds": 183900,
    "memory": "45.2 MB",
    "memoryBytes": 47411200,
    "cpu": "2.3%",
    "restarts": 0,
    "result": "success",
    "enabled": true,
    "healthy": true,
    "port": 443
  },
  "timestamp": "2026-01-07T10:30:45.123Z"
}
```

### Exit Codes
- `0`: 查询成功
- `5`: 服务不存在或无法查询

---

## 5. service enable

### Usage
```bash
xray-manager service enable [options]
xm service enable
```

### Output
```
🔧 启用开机自启: xray
✅ 已启用开机自启
```

### Exit Codes
- `0`: 成功启用
- `4`: 权限不足

---

## 6. service disable

### Usage
```bash
xray-manager service disable [options]
xm service disable
```

### Output
```
🔧 禁用开机自启: xray
✅ 已禁用开机自启
```

### Exit Codes
- `0`: 成功禁用
- `4`: 权限不足

---

## Testing Checklist

### 功能测试
- [ ] start: 服务成功启动
- [ ] start: 端口占用时显示错误
- [ ] stop: 服务成功停止
- [ ] stop: `--force` 强制停止
- [ ] restart: 优雅关闭并重启
- [ ] restart: 显示预计中断时间
- [ ] restart: 报告实际中断时间
- [ ] status: 正确显示所有状态信息
- [ ] status: JSON 格式正确
- [ ] enable/disable: 开机自启设置成功

### 性能测试 (对应 FR-016)
- [ ] restart 中断时间 < 10 秒
- [ ] 优雅关闭超时正确触发 SIGKILL

### 错误处理测试
- [ ] 权限不足时显示 sudo 提示
- [ ] 服务不存在时友好提示
- [ ] 所有错误包含建议解决方案

---

**最后更新**: 2026-01-07
**状态**: ✅ 已完成
