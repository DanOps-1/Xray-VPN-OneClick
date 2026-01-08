# Contract: 标准化退出代码

**Feature**: npm-installable CLI tool for Xray service management
**Date**: 2026-01-07

---

## Standard Exit Codes (标准退出代码)

| 代码 | 常量名称 | 含义 | 使用场景 |
|------|----------|------|----------|
| `0` | `EXIT_SUCCESS` | 成功 | 命令执行成功，无错误 |
| `1` | `EXIT_GENERAL_ERROR` | 通用错误 | 未分类的错误，未知原因 |
| `2` | `EXIT_INVALID_ARGUMENT` | 参数错误 | 无效的命令行参数或选项 |
| `3` | `EXIT_CONFIG_ERROR` | 配置错误 | 配置文件错误、缺失或无法解析 |
| `4` | `EXIT_PERMISSION_ERROR` | 权限错误 | 需要 root/sudo 权限但未提供 |
| `5` | `EXIT_SERVICE_ERROR` | 服务错误 | systemd 服务操作失败 |
| `6` | `EXIT_NETWORK_ERROR` | 网络错误 | 网络连接失败或超时 |
| `7` | `EXIT_FILE_ERROR` | 文件错误 | 文件读写操作失败 |
| `8` | `EXIT_VALIDATION_ERROR` | 验证错误 | 输入验证失败（邮箱、UUID 等） |
| `9` | `EXIT_NOT_FOUND` | 未找到 | 资源不存在（用户、服务等） |
| `130` | `EXIT_SIGINT` | 用户中断 | Ctrl+C 中断程序执行 |

---

## TypeScript Constants

```typescript
// src/constants/exit-codes.ts
export const ExitCode = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_ARGUMENT: 2,
  CONFIG_ERROR: 3,
  PERMISSION_ERROR: 4,
  SERVICE_ERROR: 5,
  NETWORK_ERROR: 6,
  FILE_ERROR: 7,
  VALIDATION_ERROR: 8,
  NOT_FOUND: 9,
  SIGINT: 130
} as const;

export type ExitCode = typeof ExitCode[keyof typeof ExitCode];
```

---

## Usage Examples

### 成功退出
```typescript
// 命令执行成功
console.log('✅ 操作完成');
process.exit(ExitCode.SUCCESS);  // 退出代码 0
```

### 参数错误
```typescript
// 用户提供无效参数
if (!validAction.includes(action)) {
  console.error('❌ 错误: 无效操作:', action);
  console.error('有效操作: start, stop, restart, status');
  process.exit(ExitCode.INVALID_ARGUMENT);  // 退出代码 2
}
```

### 权限错误
```typescript
// 需要 root 权限
if (!isRoot()) {
  console.error('❌ 错误: 此操作需要 root 权限');
  console.error('请使用 sudo 运行: sudo xray-manager service start');
  process.exit(ExitCode.PERMISSION_ERROR);  // 退出代码 4
}
```

### 服务错误
```typescript
// systemd 服务操作失败
try {
  await startService('xray');
} catch (error) {
  console.error('❌ 服务启动失败:', error.message);
  console.error('建议: 查看日志 journalctl -u xray -n 50');
  process.exit(ExitCode.SERVICE_ERROR);  // 退出代码 5
}
```

### 配置错误
```typescript
// 配置文件解析失败
try {
  const config = JSON.parse(configContent);
} catch (error) {
  console.error('❌ 配置文件解析失败');
  console.error('文件:', configPath);
  console.error('错误:', error.message);
  process.exit(ExitCode.CONFIG_ERROR);  // 退出代码 3
}
```

### 用户中断
```typescript
// 捕获 Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 程序已中断');
  process.exit(ExitCode.SIGINT);  // 退出代码 130
});
```

---

## Error Mapping Table

### 按错误类型映射

| 错误类型 | 退出代码 | 示例场景 |
|----------|----------|----------|
| `ConfigError` | 3 | 配置文件 JSON 格式错误 |
| `ServiceError` | 5 | systemctl 命令返回非零退出代码 |
| `PermissionError` | 4 | `EACCES` 错误，权限被拒绝 |
| `ValidationError` | 8 | 邮箱格式无效 |
| `UserError` (not found) | 9 | 用户不存在 |
| `FileError` | 7 | 配置文件不可读 |
| `NetworkError` | 6 | 下载 Xray 核心超时 |

### 按操作映射

| 操作 | 可能的退出代码 |
|------|---------------|
| `service start` | 0, 4, 5 |
| `service stop` | 0, 4, 5 |
| `service restart` | 0, 4, 5 |
| `service status` | 0, 5 |
| `user add` | 0, 2, 3, 4, 5, 8 |
| `user delete` | 0, 4, 5, 9 |
| `user show` | 0, 9 |
| `config backup` | 0, 4, 7 |
| `config restore` | 0, 3, 4, 5, 7 |

---

## Shell Scripting Integration

### Bash 脚本示例

```bash
#!/bin/bash

# 启动服务
xray-manager service start
EXIT_CODE=$?

# 检查退出代码
case $EXIT_CODE in
  0)
    echo "服务启动成功"
    ;;
  4)
    echo "权限不足，尝试使用 sudo..."
    sudo xray-manager service start
    ;;
  5)
    echo "服务启动失败，查看日志..."
    journalctl -u xray -n 50
    exit 1
    ;;
  *)
    echo "未知错误，退出代码: $EXIT_CODE"
    exit 1
    ;;
esac
```

### 脚本自动化

```bash
#!/bin/bash
# 自动添加用户脚本

USERS=("user1@example.com" "user2@example.com" "user3@example.com")

for user in "${USERS[@]}"; do
  echo "添加用户: $user"
  xray-manager user add "$user" --no-restart --json

  if [ $? -ne 0 ]; then
    echo "添加用户失败: $user"
    exit 1
  fi
done

# 批量添加完成后重启一次服务
echo "重启服务..."
xray-manager service restart
```

---

## Testing Exit Codes

### 单元测试示例

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ExitCode } from './exit-codes';

describe('Exit Codes', () => {
  it('should exit with code 0 on success', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation();

    await successfulOperation();

    expect(exitSpy).toHaveBeenCalledWith(ExitCode.SUCCESS);
  });

  it('should exit with code 4 on permission error', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation();
    vi.spyOn(process, 'getuid').mockReturnValue(1000);  // 非 root

    await requiresRootOperation();

    expect(exitSpy).toHaveBeenCalledWith(ExitCode.PERMISSION_ERROR);
  });
});
```

### 集成测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';

describe('CLI Exit Codes', () => {
  it('should return 0 for successful service status check', async () => {
    const child = spawn('node', ['./bin/xray-manager', 'service', 'status']);

    const exitCode = await new Promise((resolve) => {
      child.on('close', resolve);
    });

    expect(exitCode).toBe(0);
  });

  it('should return 4 for service start without root', async () => {
    const child = spawn('node', ['./bin/xray-manager', 'service', 'start'], {
      uid: 1000  // 非 root 用户
    });

    const exitCode = await new Promise((resolve) => {
      child.on('close', resolve);
    });

    expect(exitCode).toBe(4);
  });
});
```

---

## Best Practices

### 1. 一致性
- 所有命令使用相同的退出代码约定
- 相同类型的错误总是返回相同的退出代码

### 2. 可测试性
- 使用常量而非魔法数字
- 在测试中模拟 `process.exit()`

### 3. 文档化
- 在 `--help` 输出中列出可能的退出代码
- 在错误消息中提示用户如何解决

### 4. Shell 友好
- 0 表示成功，非零表示失败
- 退出代码 < 256（shell 限制）

### 5. 清理资源
```typescript
async function gracefulExit(code: ExitCode) {
  try {
    // 清理资源
    await closeConnections();
    await flushLogs();
  } finally {
    process.exit(code);
  }
}
```

---

## Help Text Example

```
退出代码:
  0   成功
  1   通用错误
  2   参数错误
  3   配置错误
  4   权限不足（需要 sudo）
  5   服务操作失败
  6   网络错误
  7   文件错误
  8   输入验证失败
  9   资源未找到
  130 用户中断 (Ctrl+C)

示例:
  # 检查退出代码
  xray-manager service start
  if [ $? -eq 0 ]; then
    echo "成功"
  fi
```

---

## Constitution Compliance

### ✅ II. 简洁易用 (CR-002)
- **标准化退出代码**: 便于脚本自动化和错误处理
- **清晰的错误映射**: 每个错误类型对应唯一退出代码

### ✅ III. 可靠稳定 (CR-003)
- **一致的错误处理**: 所有命令遵循相同约定
- **Shell 友好**: 支持标准 Unix 退出代码规范

### ✅ V. 文档完整 (CR-005)
- **完整文档**: 所有退出代码都有说明和示例
- **帮助文本**: 在 `--help` 中列出退出代码

---

**最后更新**: 2026-01-07
**状态**: ✅ 已完成
