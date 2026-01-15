/**
 * TrafficManager - Unit Tests (T006)
 *
 * Tests traffic statistics service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile } from 'fs/promises';
import type { ChildProcess } from 'child_process';

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

describe('TrafficManager', () => {
  type ExecCallback = (_error: Error | null, _result: { stdout: string; stderr: string }) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockReadFile = vi.mocked(readFile);
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        policy: {
          levels: {
            '0': {
              statsUserUplink: true,
              statsUserDownlink: true,
            },
          },
        },
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use default server and port', async () => {
      const { TrafficManager } = await import('../../../src/services/traffic-manager');
      const manager = new TrafficManager();
      expect(manager.getServerAddress()).toBe('127.0.0.1:10085');
    });

    it('should accept custom server and port', async () => {
      const { TrafficManager } = await import('../../../src/services/traffic-manager');
      const manager = new TrafficManager('192.168.1.1', 10086);
      expect(manager.getServerAddress()).toBe('192.168.1.1:10086');
    });
  });

  describe('isStatsAvailable', () => {
    it('should return true when API responds with valid JSON', async () => {
      const { exec } = await import('child_process');
      const mockExec = vi.mocked(exec);

      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(null, { stdout: '{"stat":[]}', stderr: '' });
        return {} as ChildProcess;
      });

      const { TrafficManager } = await import('../../../src/services/traffic-manager');
      const manager = new TrafficManager();

      const result = await manager.isStatsAvailable();
      expect(result).toBe(true);
    });

    it('should return false when API fails', async () => {
      const { exec } = await import('child_process');
      const mockExec = vi.mocked(exec);

      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(new Error('Connection refused'), { stdout: '', stderr: '' });
        return {} as ChildProcess;
      });

      const { TrafficManager } = await import('../../../src/services/traffic-manager');
      const manager = new TrafficManager();

      const result = await manager.isStatsAvailable();
      expect(result).toBe(false);
    });
  });

  describe('getUsage', () => {
    it('should return null when stats not available', async () => {
      const { exec } = await import('child_process');
      const mockExec = vi.mocked(exec);

      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(new Error('Connection refused'), { stdout: '', stderr: '' });
        return {} as ChildProcess;
      });

      const { TrafficManager } = await import('../../../src/services/traffic-manager');
      const manager = new TrafficManager();

      const result = await manager.getUsage('test@example.com');
      expect(result).toBeNull();
    });

    it('should return traffic usage when stats available', async () => {
      const { exec } = await import('child_process');
      const mockExec = vi.mocked(exec);

      mockExec.mockImplementation((cmd: string, callback: ExecCallback) => {
        if (cmd.includes('statsquery')) {
          callback(null, { stdout: '{"stat":[]}', stderr: '' });
        } else if (cmd.includes('uplink')) {
          callback(null, { stdout: '{"stat":{"value":1000}}', stderr: '' });
        } else if (cmd.includes('downlink')) {
          callback(null, { stdout: '{"stat":{"value":2000}}', stderr: '' });
        }
        return {} as ChildProcess;
      });

      const { TrafficManager } = await import('../../../src/services/traffic-manager');
      const manager = new TrafficManager();

      const result = await manager.getUsage('test@example.com');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@example.com');
      expect(result?.uplink).toBe(1000);
      expect(result?.downlink).toBe(2000);
      expect(result?.total).toBe(3000);
    });
  });

  describe('getAllUsage', () => {
    it('should return empty array when stats not available', async () => {
      const { exec } = await import('child_process');
      const mockExec = vi.mocked(exec);

      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(new Error('Connection refused'), { stdout: '', stderr: '' });
        return {} as ChildProcess;
      });

      const { TrafficManager } = await import('../../../src/services/traffic-manager');
      const manager = new TrafficManager();

      const result = await manager.getAllUsage();
      expect(result).toEqual([]);
    });

    it('should parse all user stats from response', async () => {
      const { exec } = await import('child_process');
      const mockExec = vi.mocked(exec);

      const statsResponse = {
        stat: [
          { name: 'user>>>user1@test.com>>>traffic>>>uplink', value: 1000 },
          { name: 'user>>>user1@test.com>>>traffic>>>downlink', value: 2000 },
          { name: 'user>>>user2@test.com>>>traffic>>>uplink', value: 500 },
          { name: 'user>>>user2@test.com>>>traffic>>>downlink', value: 1500 },
        ],
      };

      mockExec.mockImplementation((_cmd: string, callback: ExecCallback) => {
        callback(null, { stdout: JSON.stringify(statsResponse), stderr: '' });
        return {} as ChildProcess;
      });

      const { TrafficManager } = await import('../../../src/services/traffic-manager');
      const manager = new TrafficManager();

      const result = await manager.getAllUsage();

      expect(result.length).toBe(2);

      const user1 = result.find((u) => u.email === 'user1@test.com');
      expect(user1?.uplink).toBe(1000);
      expect(user1?.downlink).toBe(2000);
      expect(user1?.total).toBe(3000);

      const user2 = result.find((u) => u.email === 'user2@test.com');
      expect(user2?.uplink).toBe(500);
      expect(user2?.downlink).toBe(1500);
      expect(user2?.total).toBe(2000);
    });
  });
});
