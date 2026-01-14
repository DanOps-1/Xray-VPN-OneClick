# Internal API Contracts: 流量配额管理

**Feature**: 010-traffic-quota-ui
**Date**: 2026-01-14

## Overview

本文档定义了流量配额管理功能的内部服务接口。这是一个 CLI 工具，不提供 HTTP API，所有接口都是 TypeScript 类方法。

## Service Interfaces

### 1. TrafficManager

流量统计和配额管理的核心服务。

```typescript
interface ITrafficManager {
  /**
   * 获取用户流量使用情况
   * @param email 用户邮箱
   * @returns 流量使用数据，服务未运行时返回 null
   */
  getUsage(email: string): Promise<TrafficUsage | null>;

  /**
   * 获取所有用户流量使用情况
   * @returns 所有用户的流量数据
   */
  getAllUsage(): Promise<TrafficUsage[]>;

  /**
   * 检查 Xray Stats API 是否可用
   * @returns 是否可用
   */
  isStatsAvailable(): Promise<boolean>;
}
```

### 2. QuotaManager

配额配置管理服务。

```typescript
interface IQuotaManager {
  /**
   * 获取用户配额
   * @param email 用户邮箱
   * @returns 配额配置，不存在时返回默认值
   */
  getQuota(email: string): Promise<TrafficQuota>;

  /**
   * 设置用户配额
   * @param params 配额设置参数
   */
  setQuota(params: SetQuotaParams): Promise<void>;

  /**
   * 重置用户已用流量
   * @param email 用户邮箱
   */
  resetUsage(email: string): Promise<void>;

  /**
   * 获取所有用户配额
   * @returns 用户配额映射
   */
  getAllQuotas(): Promise<Record<string, TrafficQuota>>;

  /**
   * 删除用户配额记录
   * @param email 用户邮箱
   */
  deleteQuota(email: string): Promise<void>;
}

### 3. QuotaEnforcer

配额执行服务，处理超限用户。

```typescript
interface IQuotaEnforcer {
  /**
   * 检查并执行配额限制
   * @param email 用户邮箱
   * @returns 是否超限被禁用
   */
  checkAndEnforce(email: string): Promise<boolean>;

  /**
   * 检查所有用户配额
   * @returns 被禁用的用户列表
   */
  checkAllUsers(): Promise<string[]>;

  /**
   * 重新启用被禁用的用户
   * @param email 用户邮箱
   */
  reenableUser(email: string): Promise<void>;
}
```

### 4. XrayStatsConfig

Xray 统计配置管理。

```typescript
interface IXrayStatsConfig {
  /**
   * 检查 Xray 配置是否启用了统计功能
   * @returns 是否已启用
   */
  isStatsEnabled(): Promise<boolean>;

  /**
   * 启用 Xray 统计功能
   * @param apiPort API 端口（默认 10085）
   */
  enableStats(apiPort?: number): Promise<void>;

  /**
   * 获取 API 端口
   * @returns API 端口号
   */
  getApiPort(): Promise<number>;
}
```

---

## Utility Interfaces

### 5. TrafficFormatter

流量数据格式化工具。

```typescript
interface ITrafficFormatter {
  /**
   * 格式化字节数为人类可读格式
   * @param bytes 字节数
   * @returns 格式化结果
   */
  format(bytes: number): FormattedTraffic;

  /**
   * 解析人类可读格式为字节数
   * @param input 输入字符串（如 "10GB"）
   * @returns 字节数
   */
  parse(input: string): number;
}
```
