/**
 * Operating system detection utilities
 * Feature: 009-cross-platform-support
 */

import { existsSync, readFileSync } from 'fs';
import {
  OperatingSystem,
  OsFamily,
  PackageManager,
} from '../types/platform.js';
import {
  getDistroConfig,
  isDistroSupported,
} from '../constants/supported-distros.js';

interface OsReleaseInfo {
  ID?: string;
  VERSION_ID?: string;
  VERSION?: string;
  PRETTY_NAME?: string;
  ID_LIKE?: string;
}

/**
 * Parse /etc/os-release file content
 */
function parseOsRelease(content: string): OsReleaseInfo {
  const info: OsReleaseInfo = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)=["']?([^"'\n]*)["']?$/);
    if (match) {
      const [, key, value] = match;
      (info as Record<string, string>)[key] = value;
    }
  }

  return info;
}

/**
 * Detect operating system from /etc/os-release
 */
export function detectOperatingSystem(): OperatingSystem | null {
  let osInfo: OsReleaseInfo = {};

  // Primary: /etc/os-release
  if (existsSync('/etc/os-release')) {
    const content = readFileSync('/etc/os-release', 'utf-8');
    osInfo = parseOsRelease(content);
  }
  // Fallback detection for RHEL-based systems
  else if (existsSync('/etc/almalinux-release')) {
    osInfo = { ID: 'almalinux' };
    const content = readFileSync('/etc/almalinux-release', 'utf-8');
    const match = content.match(/(\d+(\.\d+)?)/);
    if (match) osInfo.VERSION_ID = match[1];
  } else if (existsSync('/etc/rocky-release')) {
    osInfo = { ID: 'rocky' };
    const content = readFileSync('/etc/rocky-release', 'utf-8');
    const match = content.match(/(\d+(\.\d+)?)/);
    if (match) osInfo.VERSION_ID = match[1];
  } else if (existsSync('/etc/centos-release')) {
    osInfo = { ID: 'centos' };
    const content = readFileSync('/etc/centos-release', 'utf-8');
    const match = content.match(/(\d+)/);
    if (match) osInfo.VERSION_ID = match[1];
  } else if (existsSync('/etc/fedora-release')) {
    osInfo = { ID: 'fedora' };
    const content = readFileSync('/etc/fedora-release', 'utf-8');
    const match = content.match(/(\d+)/);
    if (match) osInfo.VERSION_ID = match[1];
  } else if (existsSync('/etc/debian_version')) {
    osInfo = { ID: 'debian' };
    osInfo.VERSION_ID = readFileSync('/etc/debian_version', 'utf-8').trim();
  } else {
    return null;
  }

  const id = osInfo.ID?.toLowerCase() || '';
  const versionId = osInfo.VERSION_ID || '';
  const distroConfig = getDistroConfig(id);

  return {
    id,
    name: osInfo.PRETTY_NAME || distroConfig?.displayName || id,
    version: osInfo.VERSION || versionId,
    versionId,
    family: distroConfig?.family || OsFamily.DEBIAN,
    packageManager: distroConfig?.packageManager || PackageManager.APT,
    isSupported: isDistroSupported(id),
    minVersion: distroConfig?.minVersion || '',
  };
}
