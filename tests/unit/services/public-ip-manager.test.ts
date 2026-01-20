/**
 * Tests for PublicIpManager Service
 * @module tests/unit/services/public-ip-manager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PublicIpManager, isValidIp } from '../../../src/services/public-ip-manager';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as https from 'https';

// Mock modules
vi.mock('fs');
vi.mock('fs/promises');
vi.mock('https');

describe('PublicIpManager', () => {
  const testConfigPath = '/tmp/test-server-config.json';
  let manager: PublicIpManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new PublicIpManager(testConfigPath, 0); // 0 retries for faster tests
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isValidIp', () => {
    it('should validate IPv4 addresses', () => {
      expect(isValidIp('192.168.1.1')).toBe(true);
      expect(isValidIp('8.8.8.8')).toBe(true);
      expect(isValidIp('255.255.255.255')).toBe(true);
    });

    it('should validate IPv6 addresses', () => {
      expect(isValidIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(isValidIp('::')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(isValidIp('256.1.1.1')).toBe(false);
      expect(isValidIp('not-an-ip')).toBe(false);
      expect(isValidIp('')).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return null if config file does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const config = await manager.getConfig();

      expect(config).toBeNull();
      expect(fs.existsSync).toHaveBeenCalledWith(testConfigPath);
    });

    it('should return parsed config if file exists', async () => {
      const mockConfig = {
        publicIp: '93.184.216.34',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        source: 'auto' as const,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const config = await manager.getConfig();

      expect(config).toEqual(mockConfig);
      expect(fsPromises.readFile).toHaveBeenCalledWith(testConfigPath, 'utf-8');
    });

    it('should return null if file read fails', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockRejectedValue(new Error('Read error'));

      const config = await manager.getConfig();

      expect(config).toBeNull();
    });

    it('should return null if JSON parse fails', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockResolvedValue('invalid json');

      const config = await manager.getConfig();

      expect(config).toBeNull();
    });
  });

  describe('getPublicIp', () => {
    it('should return cached IP if available', async () => {
      const mockConfig = {
        publicIp: '93.184.216.34',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        source: 'auto' as const,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const ip = await manager.getPublicIp();

      expect(ip).toBe('93.184.216.34');
    });

    it('should detect and cache IP if no cache exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const mockResponse = {
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler('93.184.216.34');
          } else if (event === 'end') {
            handler();
          }
          return mockResponse;
        }),
      };

      const mockRequest = {
        on: vi.fn(),
      };

      vi.mocked(https.get).mockImplementation((url, callback) => {
        if (typeof callback === 'function') {
          callback(mockResponse as any);
        }
        return mockRequest as any;
      });

      vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined);

      const ip = await manager.getPublicIp();

      expect(ip).toBe('93.184.216.34');
      expect(fsPromises.writeFile).toHaveBeenCalled();
    });

    it('should throw error if detection fails and no cache exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const mockRequest = {
        on: vi.fn((event, handler) => {
          if (event === 'error') {
            handler(new Error('Connection failed'));
          }
          return mockRequest;
        }),
      };

      vi.mocked(https.get).mockReturnValue(mockRequest as any);

      await expect(manager.getPublicIp()).rejects.toThrow();
    });
  });

  describe('refreshPublicIp', () => {
    it('should detect and cache new IP', async () => {
      const mockResponse = {
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler('93.184.216.34');
          } else if (event === 'end') {
            handler();
          }
          return mockResponse;
        }),
      };

      const mockRequest = {
        on: vi.fn(),
      };

      vi.mocked(https.get).mockImplementation((url, callback) => {
        if (typeof callback === 'function') {
          callback(mockResponse as any);
        }
        return mockRequest as any;
      });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined);

      const ip = await manager.refreshPublicIp();

      expect(ip).toBe('93.184.216.34');
      expect(fsPromises.writeFile).toHaveBeenCalled();
    });

    it('should throw error if detection fails', async () => {
      const mockRequest = {
        on: vi.fn((event, handler) => {
          if (event === 'error') {
            handler(new Error('Connection failed'));
          }
          return mockRequest;
        }),
      };

      vi.mocked(https.get).mockReturnValue(mockRequest as any);

      await expect(manager.refreshPublicIp()).rejects.toThrow();
    });
  });

  describe('setPublicIp', () => {
    it('should save valid IP address', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined);

      await manager.setPublicIp('93.184.216.34');

      expect(fsPromises.writeFile).toHaveBeenCalled();
      const writeCall = vi.mocked(fsPromises.writeFile).mock.calls[0];
      const savedConfig = JSON.parse(writeCall[1] as string);
      expect(savedConfig.publicIp).toBe('93.184.216.34');
      expect(savedConfig.source).toBe('manual');
    });

    it('should trim whitespace from IP', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined);

      await manager.setPublicIp('  93.184.216.34  ');

      const writeCall = vi.mocked(fsPromises.writeFile).mock.calls[0];
      const savedConfig = JSON.parse(writeCall[1] as string);
      expect(savedConfig.publicIp).toBe('93.184.216.34');
    });

    it('should throw error for invalid IP format', async () => {
      await expect(manager.setPublicIp('invalid-ip')).rejects.toThrow('Invalid IP address format');
    });

    it('should create directory if it does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fsPromises.mkdir).mockResolvedValue(undefined);
      vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined);

      await manager.setPublicIp('93.184.216.34');

      expect(fsPromises.mkdir).toHaveBeenCalled();
    });
  });

  describe('needsManualInput', () => {
    it('should return false if cached IP exists', async () => {
      const mockConfig = {
        publicIp: '93.184.216.34',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        source: 'auto' as const,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const needsInput = await manager.needsManualInput();

      expect(needsInput).toBe(false);
    });

    it('should return true if detection fails', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const mockRequest = {
        on: vi.fn((event, handler) => {
          if (event === 'error') {
            handler(new Error('Connection failed'));
          }
          return mockRequest;
        }),
      };

      vi.mocked(https.get).mockReturnValue(mockRequest as any);

      const needsInput = await manager.needsManualInput();

      expect(needsInput).toBe(true);
    });

    it('should return true if detected IP is private', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const mockResponse = {
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler('192.168.1.1'); // Private IP
          } else if (event === 'end') {
            handler();
          }
          return mockResponse;
        }),
      };

      const mockRequest = {
        on: vi.fn(),
      };

      vi.mocked(https.get).mockImplementation((url, callback) => {
        if (typeof callback === 'function') {
          callback(mockResponse as any);
        }
        return mockRequest as any;
      });

      const needsInput = await manager.needsManualInput();

      expect(needsInput).toBe(true);
    });

    it('should return false and cache IP if detection succeeds with public IP', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const mockResponse = {
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler('93.184.216.34'); // Public IP
          } else if (event === 'end') {
            handler();
          }
          return mockResponse;
        }),
      };

      const mockRequest = {
        on: vi.fn(),
      };

      vi.mocked(https.get).mockImplementation((url, callback) => {
        if (typeof callback === 'function') {
          callback(mockResponse as any);
        }
        return mockRequest as any;
      });

      vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined);

      const needsInput = await manager.needsManualInput();

      expect(needsInput).toBe(false);
      expect(fsPromises.writeFile).toHaveBeenCalled();
    });
  });

  describe('getIpSource', () => {
    it('should return source from config', async () => {
      const mockConfig = {
        publicIp: '93.184.216.34',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        source: 'manual' as const,
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fsPromises.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const source = await manager.getIpSource();

      expect(source).toBe('manual');
    });

    it('should return null if no config exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const source = await manager.getIpSource();

      expect(source).toBeNull();
    });
  });

  describe('IP detection with retries', () => {
    it('should retry on failure', async () => {
      const managerWithRetries = new PublicIpManager(testConfigPath, 1); // 1 retry
      vi.mocked(fs.existsSync).mockReturnValue(false);

      let callCount = 0;
      const mockRequest = {
        on: vi.fn((event, handler) => {
          if (event === 'error') {
            handler(new Error('Connection failed'));
          }
          return mockRequest;
        }),
      };

      const mockSuccessResponse = {
        on: vi.fn((event, handler) => {
          if (event === 'data') {
            handler('93.184.216.34');
          } else if (event === 'end') {
            handler();
          }
          return mockSuccessResponse;
        }),
      };

      vi.mocked(https.get).mockImplementation((url, callback) => {
        callCount++;
        if (callCount <= 3) {
          // First attempt, all 3 services fail
          return mockRequest as any;
        } else {
          // Second attempt, first service succeeds
          if (typeof callback === 'function') {
            callback(mockSuccessResponse as any);
          }
          return { on: vi.fn() } as any;
        }
      });

      vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined);

      const ip = await managerWithRetries.getPublicIp();

      expect(ip).toBe('93.184.216.34');
      expect(callCount).toBeGreaterThan(3); // Should have tried multiple times
    });
  });
});
