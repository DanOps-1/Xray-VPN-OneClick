# Research: 核心功能完善

**Feature**: 012-core-features-completion
**Date**: 2026-01-15

## 1. 公网 IP 检测服务选择

### Decision
使用多个公网 IP 检测服务作为备选，按优先级依次尝试：
1. `https://api.ipify.org` (主要)
2. `https://ifconfig.me/ip` (备选)
3. `https://ip.sb` (备选)

### Rationale
- ipify.org 响应快速、稳定、无需解析 HTML
- 多服务备选确保高可用性
- 所有服务返回纯文本 IP，无需复杂解析

### Alternatives Considered
- `curl ifconfig.me`: 需要外部命令依赖
- 单一服务: 可用性风险
- DNS 查询方式: 复杂度高，不适合简单场景

---

## 2. 公网 IP 缓存策略

### Decision
使用本地 JSON 文件 (`/usr/local/etc/xray/server-config.json`) 持久化缓存公网 IP，包含：
- `publicIp`: 缓存的公网 IP
- `lastUpdated`: 最后更新时间
- `source`: IP 来源 (auto/manual)

### Rationale
- 与现有配置文件存储位置一致
- JSON 格式与项目其他配置保持统一
- 支持区分自动检测和手动输入的 IP

### Alternatives Considered
- 内存缓存: 重启后丢失
- 环境变量: 不适合持久化
- 写入 Xray 配置: 会污染原始配置

---

## 3. 用户元数据存储方案

### Decision
创建独立的 `user-metadata.json` 文件存储用户元数据：
```json
{
  "users": {
    "<uuid>": {
      "createdAt": "ISO8601 timestamp",
      "status": "active|disabled|exceeded",
      "statusChangedAt": "ISO8601 timestamp"
    }
  }
}
```

### Rationale
- 与 Xray 配置分离，避免配置文件污染
- 支持独立备份和恢复
- 与现有 quota.json 结构保持一致

### Alternatives Considered
- 扩展 Xray config.json: 会被 Xray 覆盖或报错
- SQLite: 过度设计，增加依赖
- 合并到 quota.json: 职责不清晰

---

## 4. 日志查看实现方式

### Decision
使用 Node.js 原生 `fs.readFile` 读取日志文件尾部，配合 `readline` 模块按行处理：
- 默认显示最后 50 行
- 支持访问日志和错误日志切换
- 使用 chalk 进行语法高亮

### Rationale
- 无需额外依赖
- 内存效率高（流式读取）
- 现有 log-manager.ts 已有基础实现

### Alternatives Considered
- `tail -f` 命令: 需要外部进程管理
- 全文件读取: 大文件内存问题
- 第三方日志库: 增加依赖

---

## 5. 配置备份命名规范

### Decision
备份文件命名格式: `config-backup-YYYYMMDD-HHmmss.json`
存储路径: `/var/backups/xray/`

### Rationale
- 时间戳确保唯一性
- 易于按时间排序
- 与现有 config-manager.ts 的备份逻辑一致

### Alternatives Considered
- UUID 命名: 不直观
- 序号命名: 需要额外状态管理
- 覆盖式备份: 无法回滚到特定时间点

---

## 6. HTTP 请求实现

### Decision
使用 Node.js 原生 `https` 模块进行公网 IP 检测请求，不引入额外 HTTP 客户端库。

### Rationale
- 项目当前无 HTTP 客户端依赖
- 请求简单，无需复杂功能
- 减少依赖体积

### Alternatives Considered
- axios: 功能过剩
- node-fetch: 需要额外依赖
- got: 功能过剩

---

## 7. 现有服务复用分析

### log-manager.ts
- 已实现: `readAccessLog()`, `readErrorLog()`, `getLogPath()`
- 需要: 添加行数限制参数，连接到菜单

### config-manager.ts
- 已实现: `readConfig()`, `writeConfig()`, `backupConfig()`, `listBackups()`, `restoreBackup()`
- 需要: 连接到菜单，添加格式化显示

### quota-enforcer.ts
- 已实现: `enforceQuotas()`, `checkUser()`, `reenableUser()`
- 需要: 添加到配额管理菜单

---

## 8. 国际化考虑

### Decision
新增功能的所有用户可见文本需要同时支持中英文，复用现有 `i18n.ts` 配置。

### Rationale
- 项目已有完整的国际化支持
- 保持用户体验一致性

### Implementation
在 `src/config/i18n.ts` 中添加新的翻译键值对。
