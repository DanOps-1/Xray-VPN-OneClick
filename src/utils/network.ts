/**
 * Network detection utilities
 * Feature: 009-cross-platform-support
 */

import { execSync } from 'child_process';
import * as https from 'https';
import { NetworkConfig, NetworkInterface } from '../types/platform.js';
import { PRIVATE_IP_RANGES } from '../constants/supported-distros.js';

/**
 * Public IP detection result
 */
export interface PublicIpResult {
  ip: string;
  success: boolean;
  error?: string;
  provider?: string;
}

/**
 * Default timeout for IP detection (3 seconds)
 */
const DEFAULT_TIMEOUT = 3000;

/**
 * IP detection services in priority order
 */
const IP_DETECTION_SERVICES = [
  { name: 'ipify', url: 'https://api.ipify.org' },
  { name: 'ifconfig.me', url: 'https://ifconfig.me/ip' },
  { name: 'ip.sb', url: 'https://api.ip.sb/ip' },
];

/**
 * Validate IPv4 address format
 */
function isValidIpv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Validate IPv6 address format (simplified)
 */
function isValidIpv6(ip: string): boolean {
  const ipv6Regex =
    /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:)*:([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(ip);
}

/**
 * Validate IP address (IPv4 or IPv6)
 */
export function isValidIp(ip: string): boolean {
  return isValidIpv4(ip) || isValidIpv6(ip);
}

/**
 * Fetch public IP from a single service with timeout
 *
 * @param url - Service URL
 * @param timeout - Timeout in milliseconds
 * @returns Promise resolving to IP string or rejecting on error
 */
function fetchFromService(url: string, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${timeout}ms`));
    }, timeout);

    const req = https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        clearTimeout(timeoutId);
        const ip = data.trim();

        if (isValidIp(ip)) {
          resolve(ip);
        } else {
          reject(new Error(`Invalid IP response: ${ip.substring(0, 50)}`));
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

/**
 * Fetch public IP address with timeout and retry
 *
 * @param timeout - Timeout per request in milliseconds (default: 3000)
 * @param maxRetries - Maximum retry attempts (default: 1)
 * @returns Public IP detection result
 */
export async function fetchPublicIp(
  timeout: number = DEFAULT_TIMEOUT,
  maxRetries: number = 1
): Promise<PublicIpResult> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    for (const service of IP_DETECTION_SERVICES) {
      try {
        const ip = await fetchFromService(service.url, timeout);
        return {
          ip,
          success: true,
          provider: service.name,
        };
      } catch {
        // Try next service
        continue;
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
 * Check if an IP address is private (NAT)
 */
export function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((regex) => regex.test(ip));
}

/**
 * Get all network interfaces with IPv4 addresses
 */
export function getNetworkInterfaces(): NetworkInterface[] {
  const interfaces: NetworkInterface[] = [];

  try {
    const output = execSync('ip -4 addr show', { encoding: 'utf-8' });
    const lines = output.split('\n');

    let currentInterface: Partial<NetworkInterface> = {};

    for (const line of lines) {
      // Match interface line: "2: eth0: <BROADCAST..."
      const ifaceMatch = line.match(/^\d+:\s+(\S+):/);
      if (ifaceMatch) {
        if (currentInterface.name) {
          interfaces.push(currentInterface as NetworkInterface);
        }
        currentInterface = {
          name: ifaceMatch[1],
          isLoopback: ifaceMatch[1] === 'lo',
        };
      }

      // Match inet line: "    inet 192.168.1.100/24..."
      const inetMatch = line.match(/^\s+inet\s+(\d+\.\d+\.\d+\.\d+)/);
      if (inetMatch && currentInterface.name) {
        currentInterface.ipv4 = inetMatch[1];
      }
    }

    // Add last interface
    if (currentInterface.name) {
      interfaces.push(currentInterface as NetworkInterface);
    }
  } catch {
    // Failed to get interfaces
  }

  return interfaces.filter((iface) => !iface.isLoopback && iface.ipv4);
}

/**
 * Detect network configuration
 */
export function detectNetwork(): NetworkConfig {
  const interfaces = getNetworkInterfaces();
  const firstIp = interfaces[0]?.ipv4 || '';

  return {
    interfaces,
    selectedIp: firstIp,
    isNat: isPrivateIp(firstIp),
  };
}
