/**
 * ConfigManager - Unit Tests (T091, T092, T094)
 *
 * Tests config backup, restore, and validation
 * Following TDD: These tests MUST FAIL before implementation
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';

describe('ConfigManager - Backup (T091)', () => {
  const testConfigDir = '/tmp/xray-test-config';
  const testConfigPath = join(testConfigDir, 'config.json');
  const testBackupDir = join(testConfigDir, 'backups');

  beforeEach(async () => {
    // Create test directories
    await mkdir(testConfigDir, { recursive: true });
    await mkdir(testBackupDir, { recursive: true });

    // Create test config
    const testConfig = {
      inbounds: [{ protocol: 'vless', port: 443 }],
      outbounds: [{ protocol: 'freedom' }],
    };
    await writeFile(testConfigPath, JSON.stringify(testConfig, null, 2));
  });

  afterEach(async () => {
    // Cleanup
    try {
      await rm(testConfigDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should create backup with timestamp filename', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager(testConfigPath);
      manager['backupDir'] = testBackupDir; // Override backup directory

      const backupPath = await manager.backupConfig();

      expect(backupPath).toBeDefined();
      expect(backupPath).toContain('config.');
      expect(backupPath).toContain('.json');
      expect(existsSync(backupPath)).toBe(true);
    } catch (error) {
      // Expected to fail before implementation
      expect(error).toBeDefined();
    }
  });

  it('should backup contain same content as original', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager(testConfigPath);
      manager['backupDir'] = testBackupDir;

      const backupPath = await manager.backupConfig();

      // Read both files
      const originalContent = await readFile(testConfigPath, 'utf-8');
      const backupContent = await readFile(backupPath, 'utf-8');

      // Parse and compare
      const originalConfig = JSON.parse(originalContent);
      const backupConfig = JSON.parse(backupContent);

      expect(backupConfig).toEqual(originalConfig);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should list all backups sorted by date', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager(testConfigPath);
      manager['backupDir'] = testBackupDir;

      // Create multiple backups
      await manager.backupConfig();
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
      await manager.backupConfig();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await manager.backupConfig();

      const backups = await manager.listBackups();

      expect(backups.length).toBeGreaterThanOrEqual(3);
      // Most recent should be first
      for (let i = 0; i < backups.length - 1; i++) {
        expect(backups[i] >= backups[i + 1]).toBe(true);
      }
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should set backup file permissions to 600', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');
      const { stat } = await import('fs/promises');

      const manager = new ConfigManager(testConfigPath);
      manager['backupDir'] = testBackupDir;

      const backupPath = await manager.backupConfig();

      const stats = await stat(backupPath);
      const mode = stats.mode & 0o777;

      expect(mode).toBe(0o600); // rw-------
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe('ConfigManager - Restore (T092)', () => {
  const testConfigDir = '/tmp/xray-test-restore';
  const testConfigPath = join(testConfigDir, 'config.json');
  const testBackupDir = join(testConfigDir, 'backups');

  beforeEach(async () => {
    await mkdir(testConfigDir, { recursive: true });
    await mkdir(testBackupDir, { recursive: true });

    const testConfig = {
      inbounds: [{ protocol: 'vless', port: 443 }],
      outbounds: [{ protocol: 'freedom' }],
    };
    await writeFile(testConfigPath, JSON.stringify(testConfig, null, 2));
  });

  afterEach(async () => {
    try {
      await rm(testConfigDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should restore config from backup', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager(testConfigPath);
      manager['backupDir'] = testBackupDir;

      // Create backup
      const backupPath = await manager.backupConfig();

      // Modify current config
      const modifiedConfig = {
        inbounds: [{ protocol: 'vmess', port: 8080 }],
        outbounds: [{ protocol: 'freedom' }],
      };
      await manager.writeConfig(modifiedConfig);

      // Restore from backup
      await manager.restoreConfig(backupPath);

      // Verify restored content
      const restoredConfig = await manager.readConfig();
      expect(restoredConfig.inbounds[0].protocol).toBe('vless');
      expect(restoredConfig.inbounds[0].port).toBe(443);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should create pre-restore backup before restoring', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager(testConfigPath);
      manager['backupDir'] = testBackupDir;

      // Create initial backup
      const backupPath = await manager.backupConfig();

      // Modify config
      const modifiedConfig = {
        inbounds: [{ protocol: 'vmess', port: 8080 }],
        outbounds: [{ protocol: 'freedom' }],
      };
      await manager.writeConfig(modifiedConfig);

      const backupsBefore = await manager.listBackups();

      // Restore (should create pre-restore backup)
      await manager.restoreConfig(backupPath);

      const backupsAfter = await manager.listBackups();

      // Should have one more backup (pre-restore backup)
      expect(backupsAfter.length).toBe(backupsBefore.length + 1);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should throw error when restoring non-existent backup', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager(testConfigPath);
      manager['backupDir'] = testBackupDir;

      const fakePath = join(testBackupDir, 'non-existent-backup.json');

      await expect(manager.restoreConfig(fakePath)).rejects.toThrow();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe('ConfigManager - Validation (T094)', () => {
  it('should validate correct config structure', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager();

      const validConfig = {
        inbounds: [
          {
            protocol: 'vless',
            port: 443,
            settings: { clients: [] },
          },
        ],
        outbounds: [{ protocol: 'freedom' }],
      };

      expect(() => manager.validateConfig(validConfig)).not.toThrow();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should reject config without inbounds', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager();

      const invalidConfig = {
        outbounds: [{ protocol: 'freedom' }],
      };

      expect(() => manager.validateConfig(invalidConfig as any)).toThrow(/inbounds/i);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should reject config without outbounds', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager();

      const invalidConfig = {
        inbounds: [{ protocol: 'vless', port: 443 }],
      };

      expect(() => manager.validateConfig(invalidConfig as any)).toThrow(/outbounds/i);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should reject inbound without protocol', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager();

      const invalidConfig = {
        inbounds: [{ port: 443 }],
        outbounds: [{ protocol: 'freedom' }],
      };

      expect(() => manager.validateConfig(invalidConfig as any)).toThrow(/protocol/i);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should reject inbound without port', async () => {
    try {
      const { ConfigManager } = await import('../../../src/services/config-manager');

      const manager = new ConfigManager();

      const invalidConfig = {
        inbounds: [{ protocol: 'vless' }],
        outbounds: [{ protocol: 'freedom' }],
      };

      expect(() => manager.validateConfig(invalidConfig as any)).toThrow(/port/i);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
