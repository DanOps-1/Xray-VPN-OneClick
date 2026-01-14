/**
 * Quota Flow Integration Tests
 *
 * Tests the complete quota management workflow
 *
 * @module tests/integration/quota-flow.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuotaManager } from '../../src/services/quota-manager';
import { formatTraffic, parseTraffic, calculateUsagePercent, getAlertLevel } from '../../src/utils/traffic-formatter';
import { renderProgressBar, renderCompactBar, renderMiniIndicator } from '../../src/components/progress-bar';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Quota Flow Integration Tests', () => {
  let tempDir: string;
  let quotaConfigPath: string;
  let quotaManager: QuotaManager;

  beforeEach(async () => {
    // Create unique temp directory for each test
    tempDir = path.join(os.tmpdir(), `quota-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(tempDir, { recursive: true });
    quotaConfigPath = path.join(tempDir, 'quota.json');
    quotaManager = new QuotaManager(quotaConfigPath);
  });

  afterEach(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Quota Manager', () => {
    it('should create quota config file on first write', async () => {
      await quotaManager.setQuota({
        email: 'test@example.com',
        quotaBytes: 10 * 1024 * 1024 * 1024, // 10 GB
        quotaType: 'limited',
      });

      const exists = await fs.access(quotaConfigPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should set and retrieve quota correctly', async () => {
      const email = 'user@example.com';
      const quotaBytes = 5 * 1024 * 1024 * 1024; // 5 GB

      await quotaManager.setQuota({
        email,
        quotaBytes,
        quotaType: 'limited',
      });

      const quota = await quotaManager.getQuota(email);
      expect(quota.quotaBytes).toBe(quotaBytes);
      expect(quota.quotaType).toBe('limited');
      expect(quota.status).toBe('active');
    });

    it('should handle unlimited quota', async () => {
      const email = 'unlimited@example.com';

      await quotaManager.setQuota({
        email,
        quotaBytes: -1,
        quotaType: 'unlimited',
      });

      const quota = await quotaManager.getQuota(email);
      expect(quota.quotaBytes).toBe(-1);
      expect(quota.quotaType).toBe('unlimited');
    });

    it('should update usage correctly', async () => {
      const email = 'usage@example.com';
      const usedBytes = 2 * 1024 * 1024 * 1024; // 2 GB

      await quotaManager.setQuota({
        email,
        quotaBytes: 10 * 1024 * 1024 * 1024,
        quotaType: 'limited',
      });

      await quotaManager.updateUsage(email, usedBytes);

      const quota = await quotaManager.getQuota(email);
      expect(quota.usedBytes).toBe(usedBytes);
    });

    it('should reset usage and status', async () => {
      const email = 'reset@example.com';

      await quotaManager.setQuota({
        email,
        quotaBytes: 10 * 1024 * 1024 * 1024,
        quotaType: 'limited',
      });

      await quotaManager.updateUsage(email, 5 * 1024 * 1024 * 1024);
      await quotaManager.setStatus(email, 'exceeded');

      // Verify exceeded state
      let quota = await quotaManager.getQuota(email);
      expect(quota.status).toBe('exceeded');

      // Reset
      await quotaManager.resetUsage(email);

      // Verify reset
      quota = await quotaManager.getQuota(email);
      expect(quota.usedBytes).toBe(0);
      expect(quota.status).toBe('active');
    });

    it('should validate email format', async () => {
      await expect(
        quotaManager.setQuota({
          email: 'invalid-email',
          quotaBytes: 1024,
          quotaType: 'limited',
        })
      ).rejects.toThrow('无效的邮箱格式');
    });

    it('should validate quota bytes', async () => {
      await expect(
        quotaManager.setQuota({
          email: 'test@example.com',
          quotaBytes: -2, // Invalid: not -1 and not >= 0
          quotaType: 'limited',
        })
      ).rejects.toThrow('无效的配额值');
    });

    it('should get all quotas', async () => {
      await quotaManager.setQuota({
        email: 'user1@example.com',
        quotaBytes: 10 * 1024 * 1024 * 1024,
        quotaType: 'limited',
      });

      await quotaManager.setQuota({
        email: 'user2@example.com',
        quotaBytes: -1,
        quotaType: 'unlimited',
      });

      const quotas = await quotaManager.getAllQuotas();
      expect(Object.keys(quotas).length).toBeGreaterThanOrEqual(2);
      expect(quotas['user1@example.com']).toBeDefined();
      expect(quotas['user2@example.com']).toBeDefined();
    });

    it('should delete quota', async () => {
      const email = 'delete@example.com';

      await quotaManager.setQuota({
        email,
        quotaBytes: 1024,
        quotaType: 'limited',
      });

      await quotaManager.deleteQuota(email);

      const quotas = await quotaManager.getAllQuotas();
      expect(quotas[email]).toBeUndefined();
    });
  });

  describe('Traffic Formatter', () => {
    it('should format bytes correctly', () => {
      expect(formatTraffic(0).display).toBe('0 B');
      expect(formatTraffic(1024).display).toBe('1.00 KB');
      expect(formatTraffic(1024 * 1024).display).toBe('1.00 MB');
      expect(formatTraffic(1024 * 1024 * 1024).display).toBe('1.00 GB');
      expect(formatTraffic(1024 * 1024 * 1024 * 1024).display).toBe('1.00 TB');
    });

    it('should parse traffic strings correctly', () => {
      expect(parseTraffic('1KB')).toBe(1024);
      expect(parseTraffic('1MB')).toBe(1024 * 1024);
      expect(parseTraffic('1GB')).toBe(1024 * 1024 * 1024);
      expect(parseTraffic('1TB')).toBe(1024 * 1024 * 1024 * 1024);
      expect(parseTraffic('10GB')).toBe(10 * 1024 * 1024 * 1024);
      expect(parseTraffic('无限制')).toBe(-1);
      expect(parseTraffic('unlimited')).toBe(-1);
    });

    it('should calculate usage percent correctly', () => {
      expect(calculateUsagePercent(50, 100)).toBe(50);
      expect(calculateUsagePercent(100, 100)).toBe(100);
      // calculateUsagePercent caps at 100
      expect(calculateUsagePercent(150, 100)).toBe(100);
      expect(calculateUsagePercent(50, -1)).toBe(0); // Unlimited
      expect(calculateUsagePercent(50, 0)).toBe(0); // Zero quota
    });

    it('should determine alert level correctly', () => {
      expect(getAlertLevel(50)).toBe('normal');
      expect(getAlertLevel(79)).toBe('normal');
      expect(getAlertLevel(80)).toBe('warning');
      expect(getAlertLevel(99)).toBe('warning');
      expect(getAlertLevel(100)).toBe('exceeded');
      expect(getAlertLevel(150)).toBe('exceeded');
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar', () => {
      const bar = renderProgressBar(50, { width: 10, showPercent: false });
      expect(bar).toContain('[');
      expect(bar).toContain(']');
    });

    it('should render compact bar', () => {
      const bar = renderCompactBar(50, 5);
      expect(bar.length).toBeGreaterThan(0);
    });

    it('should render mini indicator', () => {
      expect(renderMiniIndicator(50)).toContain('●');
      expect(renderMiniIndicator(85)).toContain('●');
      expect(renderMiniIndicator(100)).toContain('●');
    });
  });

  describe('Quota Enforcer', () => {
    it('should calculate alert levels correctly', () => {
      // Testing through the quota manager's calculateAlertLevel
      expect(quotaManager.calculateAlertLevel(50, 100)).toBe('normal');
      expect(quotaManager.calculateAlertLevel(85, 100)).toBe('warning');
      expect(quotaManager.calculateAlertLevel(100, 100)).toBe('exceeded');
      expect(quotaManager.calculateAlertLevel(100, -1)).toBe('normal'); // Unlimited
    });
  });

  describe('Complete Quota Flow', () => {
    it('should handle complete quota lifecycle', async () => {
      const email = 'lifecycle@example.com';
      const quotaBytes = 10 * 1024 * 1024 * 1024; // 10 GB

      // 1. Create user quota
      await quotaManager.setQuota({
        email,
        quotaBytes,
        quotaType: 'limited',
      });

      // 2. Verify initial state
      let quota = await quotaManager.getQuota(email);
      expect(quota.status).toBe('active');
      expect(quota.usedBytes).toBe(0);

      // 3. Simulate usage (50%)
      await quotaManager.updateUsage(email, quotaBytes * 0.5);
      quota = await quotaManager.getQuota(email);
      expect(quotaManager.calculateAlertLevel(quota.usedBytes, quota.quotaBytes)).toBe('normal');

      // 4. Simulate usage (85% - warning)
      await quotaManager.updateUsage(email, quotaBytes * 0.85);
      quota = await quotaManager.getQuota(email);
      expect(quotaManager.calculateAlertLevel(quota.usedBytes, quota.quotaBytes)).toBe('warning');

      // 5. Simulate usage (100% - exceeded)
      await quotaManager.updateUsage(email, quotaBytes);
      quota = await quotaManager.getQuota(email);
      expect(quotaManager.calculateAlertLevel(quota.usedBytes, quota.quotaBytes)).toBe('exceeded');

      // 6. Mark as exceeded
      await quotaManager.setStatus(email, 'exceeded');
      quota = await quotaManager.getQuota(email);
      expect(quota.status).toBe('exceeded');

      // 7. Reset and re-enable
      await quotaManager.resetUsage(email);
      quota = await quotaManager.getQuota(email);
      expect(quota.status).toBe('active');
      expect(quota.usedBytes).toBe(0);
    });

    it('should handle multiple users', async () => {
      const users = [
        { email: 'multi1@example.com', quotaBytes: 5 * 1024 * 1024 * 1024 },
        { email: 'multi2@example.com', quotaBytes: 10 * 1024 * 1024 * 1024 },
        { email: 'multi3@example.com', quotaBytes: -1 }, // Unlimited
      ];

      // Create all users
      for (const user of users) {
        await quotaManager.setQuota({
          email: user.email,
          quotaBytes: user.quotaBytes,
          quotaType: user.quotaBytes < 0 ? 'unlimited' : 'limited',
        });
      }

      // Verify all quotas
      const quotas = await quotaManager.getAllQuotas();

      // Check specific quotas exist
      expect(quotas['multi1@example.com']).toBeDefined();
      expect(quotas['multi2@example.com']).toBeDefined();
      expect(quotas['multi3@example.com']).toBeDefined();

      // Check specific quotas values
      expect(quotas['multi1@example.com'].quotaBytes).toBe(5 * 1024 * 1024 * 1024);
      expect(quotas['multi2@example.com'].quotaBytes).toBe(10 * 1024 * 1024 * 1024);
      expect(quotas['multi3@example.com'].quotaBytes).toBe(-1);
    });
  });
});
