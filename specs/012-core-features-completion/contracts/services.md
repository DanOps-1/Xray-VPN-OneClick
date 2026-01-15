# Service Contracts: 核心功能完善

**Feature**: 012-core-features-completion
**Date**: 2026-01-15

## 1. PublicIpManager

公网 IP 检测与缓存服务。

### Interface

```typescript
interface PublicIpManager {
  /**
   * 获取公网 IP（优先使用缓存）
   * @returns 公网 IP 地址
   * @throws Error 如果无法获取且无缓存
   */
  getPublicIp(): Promise<string>;

  /**
   * 强制刷新公网 IP（忽略缓存）
   * @returns 新检测到的公网 IP
   * @throws Error 如果检测失败
   */
  refreshPublicIp(): Promise<string>;

  /**
   * 手动设置公网 IP
   * @param ip - 要设置的 IP 地址
   * @throws Error 如果 IP 格式无效
   */
  setPublicIp(ip: string): Promise<void>;

  /**
   * 获取当前配置
   * @returns ServerConfig 对象或 null
   */
  getConfig(): Promise<ServerConfig | null>;

  /**
   * 检查是否需要手动输入（NAT 环境或检测失败）
   * @returns true 如果需要手动输入
   */
  needsManualInput(): Promise<boolean>;
}
```

### Behavior

| Method | Timeout | Retry | Fallback |
|--------|---------|-------|----------|
| getPublicIp | 3s | 1 | 使用缓存或提示手动输入 |
| refreshPublicIp | 3s | 1 | 抛出错误 |
| setPublicIp | N/A | N/A | N/A |

### Error Codes

| Code | Description |
|------|-------------|
| `IP_DETECTION_FAILED` | 所有检测服务均失败 |
| `INVALID_IP_FORMAT` | 提供的 IP 格式无效 |
| `CONFIG_WRITE_FAILED` | 无法写入配置文件 |

---

## 2. UserMetadataManager

用户元数据持久化服务。

### Interface

```typescript
interface UserMetadataManager {
  /**
   * 获取用户元数据
   * @param userId - 用户 UUID
   * @returns 用户元数据或 null
   */
  getMetadata(userId: string): Promise<UserMeta | null>;

  /**
   * 设置用户元数据（创建或更新）
   * @param userId - 用户 UUID
   * @param metadata - 元数据对象
   */
  setMetadata(userId: string, metadata: Partial<UserMeta>): Promise<void>;

  /**
   * 创建新用户元数据（设置创建时间）
   * @param userId - 用户 UUID
   * @returns 创建的元数据
   */
  createUser(userId: string): Promise<UserMeta>;

  /**
   * 更新用户状态
   * @param userId - 用户 UUID
   * @param status - 新状态
   */
  updateStatus(userId: string, status: UserStatus): Promise<void>;

  /**
   * 删除用户元数据
   * @param userId - 用户 UUID
   */
  deleteMetadata(userId: string): Promise<void>;

  /**
   * 获取所有用户元数据
   * @returns 用户元数据映射
   */
  getAllMetadata(): Promise<Record<string, UserMeta>>;
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `USER_NOT_FOUND` | 用户元数据不存在 |
| `INVALID_UUID` | UUID 格式无效 |
| `METADATA_WRITE_FAILED` | 无法写入元数据文件 |

---

## 3. LogManager (扩展)

日志管理服务扩展。

### Interface (新增方法)

```cript
interface LogManager {
  // 现有方法...

  /**
   * 读取访问日志（带行数限制）
   * @param lines - 要读取的行数，默认 50
   * @returns 日志条目数组
   */
  readAccessLog(lines?: number): Promise<LogEntry[]>;

  /**
   * 读取错误日志（带行数限制）
   * @param lines - 要读取的行数，默认 50
   * @returns 日志条目数组
   */
  readErrorLog(lines?: number): Promise<LogEntry[]>;

  /**
   * 检查日志文件是否存在
   * @param type - 日志类型
   * @returns true 如果文件存在
   */
  logExists(type: 'access' | 'error'): Promise<boolean>;
}
```

---

## 4. ConfigManager (扩展)

配置管理服务扩展。

### Interface (新��方法)

```typescript
interface ConfigManager {
  // 现有方法...

  /**
   * 获显示）
   * @returns 格式化的 JSON 字符串
   */
  getFormattedConfig(): Promise<string>;

  /**
   * 列出所有备份文件
   * @returns 备份信息数组，按时间倒序
   */
  listBackups(): Promise<ConfigBackup[]>;

  /**
   * 从指定备份恢复配置
   * @param backupPath - 备份文件路径
   * @param restartService - 是否自动重启服务，默认 true
   */
  restoreFromBackup(backupPath: string, restartService?: boolean): Promise<void>;
}
```

---

## 5. QuotaEnforcer (菜单集成)

配额执行服务（已存在，需集成到菜单）。

### Interface (现有)

```typescript
interface QuotaEnforcer {
  /**
   * 执行配额检查并返回摘要
   * @param autoDisable - 是否自动禁用超限用户
   * @returns 执行摘要
   */
  enforceQuotas(autoDisable?: boolean): Promise<EnforcementSummary>;

  /**
   * 检查单个用户配额
   * @param email - 用户邮箱
   * @param autoDisable - 是否自动禁用
   * @returns 检查结果
   */
  checkUser(email: string, autoDisable?: boolean): Promise<EnforcementResult | null>;

  /**
   * 重新启用被禁用的用户
   * @param email - 用户邮箱
   * @param resetUsage - 是否重置使用量
   */
  reenableUser(email: string, resetUsage?: boolean): Promise<void>;
}
```

---

## 6. Menu Commands

### logs.ts 命令接口

```typescript
/**
 * 显示日志查看子菜单
 */
async function showLogsMenu(options: MenuOptions): Promise<void>;

/**
 * 显示访问日志
 */
async function viewAccessLogs(options: MenuOptions): Promise<void>;

/**
 * 显示错误日志
 */
async function viewErrorLogs(options: MenuOptions): Promise<void>;
```

### config.ts 命令接口

```typescript
/**
 * 显示配置管理子菜单
 */
async function showConfigMenu(options: MenuOptions): Promise<void>;

/**
 * 显示当前配置
 */
async function viewConfig(options: MenuOptions): Promise<void>;

/**
 * 创建配置备份
 */
async function createBackup(options: MenuOptions): Promise<void>;

/**
 * 恢复配置
 */
async function restoreConfig(options: MenuOptions): Promise<void>;
```

### quota.ts 命令扩展

```typescript
/**
 * 执行配额检查（新增）
 */
async function executeQuotaCheck(options: MenuOptions): Promise<void>;
```
