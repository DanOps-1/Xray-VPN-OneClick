/**
 * QuotaManager - Unit Tests (T007)
 *
 * Tests quota configuration management service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';

describe('QuotaManager', () => {
  const testDir = '/tmp/xray-quota-test';
  const testConfigPath = join(testDir, 'quota.json');

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('readConfig', () => {
    it('should return default config when file does not exist', async () => {
      const { QuotaManager } = await import('../../../src/services/quota-manager');
      const manager = new QuotaManager(testConfigPath);

      const config = await manager.readConfig();

      expect(config.version).toBe('1.0');
      expect(config.apiPort).toBe(10085);
      expect(config.users).toEqual({});
    });

    it('should read existing config file', async () => {
      const existingConfig = {
        version: '1.0',
        apiPort: 10086,
        users: {
          'test@example.com': {
            quotaBytes: 1024,
            quotaType: 'limited',
            usedBytes: 100,
            lastReset: '2026-01-01T00:00:00Z',
            status: 'active',
          },
        },
      };
      await writeFile(testConfigPath, JSON.stringify(existingConfig));

      const { QuotaManager } = await import('../../../src/services/quota-manager');
      const manager = new QuotaManager(testConfigPath);

      const config = await manager.readConfig();

      expect(config.apiPort).toBe(10086);
      expect(config.users['test@example.com']).toBeDefined();
    });
  });

  describe('getQuota', () => {
    it('should return default quota for non-existent user', async () => {
      const { QuotaManager } = await import('../../../src/services/quota-manager');
      const manager = new QuotaManager(testConfigPath);

      const quota = await manager.getQuota('nonexistent@example.com');

      expect(quota.quotaBytes).toBe(-1);
      expect(quota.quotaType).toBe('unlimited');
      expect(quota.status).toBe('active');
    });

    it('should return existing quota for user', async () => {
      const existingConfig = {
        version: '1.0',
        apiPort: 10085,
        users: {
          'test@example.com': {
            quotaBytes: 10 * 1024 ** 3,
            quotaType: 'limited',
            usedBytes: 5 * 1024 ** 3,
            lastReset: '2026-01-01T00:00:00Z',
            status: 'active',
          },
        },
      };
      await writeFile(testConfigPath, JSON.stringify(existingConfig));

      const { QuotaManager } = await import('../../../src/services/quota-manager');
      const manager = new QuotaManager(testConfigPath);

      const quota = await manager.getQuota('test@example.com');

      expect(quota.quotaBytes).toBe(10 * 1024 ** 3);
      expect(quota.quotaType).toBe('limited');
    });
  });

  describe('setQuota', () => {
    it('should create new quota for user', async () => {
      const { QuotaManager } = await import('../../../src/services/quota-manager');
      const manager = new QuotaManager(testConfigPath);

      await manager.setQuota({
        email: 'new@example.com',
        quotaBytes: 10 * 1024 ** 3,
        quotaType: 'limited',
      });

      const quota = await manager.getQuota('new@example.com');
      expect(quota.quotaBytes).toBe(10 * 1024 ** 3);
      expect(quota.quotaType).toBe('limited');
      expect(quota.usedBytes).toBe(0);
    });

    it('should preserve existing usage when updating quota', async () => {
      const existingConfig = {
        version: '1.0',
        apiPort: 10085,
        users: {
          'test@example.com': {
            quotaBytes: 5 * 1024 ** 3,
            quotaType: 'limited',
            usedBytes: 2 * 1024 ** 3,
            lastReset: '2026-01-01T00:00:00Z',
            status: 'active',
          },
        },
      };
      await writeFile(testConfigPath, JSON.stringify(existingConfig));

      const { QuotaManager } = await import('../../../src/services/quota-manager');
      const manager = new QuotaManager(testConfigPath);

      await manager.setQuota({
        email: 'test@example.com',
        quotaBytes: 10 * 1024 ** 3,
        quotaType: 'limited',
      });

      const quota = await manager.getQuota('test@example.com');
      expect(quota.quotaBytes).toBe(10 * 1024 ** 3);
      expect(quota.usedBytes).toBe(2 * 1024 ** 3);
    });
  });
});
