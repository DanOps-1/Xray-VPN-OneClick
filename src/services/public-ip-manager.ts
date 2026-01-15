/**
 * PublicIpManager - Public IP Detection and Caching Service
 *
 * Provides automatic public IP detection with fallback to manual input
 *
 * @module services/public-ip-manager
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';
import * as https from 'https';
import { DEFAULT_PATHS } from '../constants/paths';
import { isPrivateIp } from '../utils/network';
import type { ServerConfig, IpSource, IpDetectionResult, IpDetectionService } from '../types/server-config';

/**
 * Default IP detection services (in priority order)
 */
const IP_SERVICES: IpDetectionService[] = [
  { name: 'ipify', url: 'https://api.ipify.org', timeout: 3000 },
  { name: 'ifconfig.me', url: 'https://ifconfig.me/ip', timeout: 3000 },
  { name: 'ip.sb', url: 'https://api.ip.sb/ip', timeout: 3000 },
];

/**
 * Validate IPv4 address format
 */
function isValidIpv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Validate IPv6 address format (simplified)
 */
function isValidIpv6(ip: string): boolean {
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:)*:([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(ip);
}

/**
 * Validate IP address (IPv4 or IPv6)
 */
export function isValidIp(ip: string): boolean {
  return isValidIpv4(ip) || isValidIpv6(ip);
}

/**
 * Fetch IP from a single service with timeout
 */
function fetchIpFromService(service: IpDetectionService): Promise<IpDetectionResult> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        ip: '',
        success: false,
        error: `Timeout after ${service.timeout}ms`,
        provider: service.name,
      });
    }, service.timeout);

    const req = https.get(service.url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        clearTimeout(timeoutId);
        const ip = data.trim();

        if (isValidIp(ip)) {
          resolve({
            ip,
            success: true,
            provider: service.name,
          });
        } else {
          resolve({
            ip: '',
            success: false,
            error: `Invalid IP response: ${ip.substring(0, 50)}`,
            provider: service.name,
          });
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({
        ip: '',
        success: false,
        error: error.message,
        provider: service.name,
      });
    });
  });
}

/**
 * PublicIpManager - Manage public IP detection and caching
 */
export class PublicIpManager {
  private configPath: string;
  private maxRetries: number;

  /**
   * Create a new PublicIpManager
   *
   * @param configPath - Path to server config file
   * @param maxRetries - Maximum retry attempts (default: 1)
   */
  constructor(configPath?: string, maxRetries: number = 1) {
    this.configPath = configPath || DEFAULT_PATHS.SERVER_CONFIG_FILE;
    this.maxRetries = maxRetries;
  }

  /**
   * Read server config from file
   *
   * @returns ServerConfig or null if not found
   */
  async getConfig(): Promise<ServerConfig | null> {
    try {
      if (!existsSync(this.configPath)) {
        return null;
      }
      const content = await readFile(this.configPath, 'utf-8');
      return JSON.parse(content) as ServerConfig;
    } catch {
      return null;
    }
  }

  /**
   * Save server config to file
   *
   * @param config - ServerConfig to save
   */
  private async saveConfig(config: ServerConfig): Promise<void> {
    const dir = dirname(this.configPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * Detect public IP from external services
   *
   * @returns Detection result
   */
  private async detectPublicIp(): Promise<IpDetectionResult> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      for (const service of IP_SERVICES) {
        const result = await fetchIpFromService(service);
        if (result.success) {
          return result;
        }
      }
    }

    return {
      ip: '',
      success: false,
      error: 'All IP detection services failed after retries',
    };
  }

  /**
   * Get public IP (from cache or detect)
   *
   * @returns Public IP address
   * @throws Error if unable to get IP and no cache exists
   */
  async getPublicIp(): Promise<string> {
    // Try to get from cache first
    const config = await this.getConfig();
    if (config?.publicIp) {
      return config.publicIp;
    }

    // Try to detect
    const result = await this.detectPublicIp();
    if (result.success) {
      // Cache the result
      await this.saveConfig({
        publicIp: result.ip,
        lastUpdated: new Date().toISOString(),
        source: 'auto',
      });
      return result.ip;
    }

    throw new Error(result.error || 'Failed to detect public IP');
  }

  /**
   * Force refresh public IP (ignore cache)
   *
   * @returns New public IP address
   * @throws Error if detection fails
   */
  async refreshPublicIp(): Promise<string> {
    const result = await this.detectPublicIp();
    if (result.success) {
      await this.saveConfig({
        publicIp: result.ip,
        lastUpdated: new Date().toISOString(),
        source: 'auto',
      });
      return result.ip;
    }

    throw new Error(result.error || 'Failed to detect public IP');
  }

  /**
   * Manually set public IP
   *
   * @param ip - IP address to set
   * @throws Error if IP format is invalid
   */
  async setPublicIp(ip: string): Promise<void> {
    const trimmedIp = ip.trim();
    if (!isValidIp(trimmedIp)) {
      throw new Error(`Invalid IP address format: ${ip}`);
    }

    await this.saveConfig({
      publicIp: trimmedIp,
      lastUpdated: new Date().toISOString(),
      source: 'manual',
    });
  }

  /**
   * Check if manual IP input is needed
   *
   * @returns true if NAT environment detected or detection fails
   */
  async needsManualInput(): Promise<boolean> {
    // Check if we already have a cached IP
    const config = await this.getConfig();
    if (config?.publicIp) {
      return false;
    }

    // Try to detect
    const result = await this.detectPublicIp();
    if (!result.success) {
      return true;
    }

    // Check if detected IP is private (NAT)
    if (isPrivateIp(result.ip)) {
      return true;
    }

    // Cache the detected IP
    await this.saveConfig({
      publicIp: result.ip,
      lastUpdated: new Date().toISOString(),
      source: 'auto',
    });

    return false;
  }

  /**
   * Get IP source (auto or manual)
   *
   * @returns IP source or null if no config
   */
  async getIpSource(): Promise<IpSource | null> {
    const config = await this.getConfig();
    return config?.source || null;
  }
}
