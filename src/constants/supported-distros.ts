/**
 * Supported Linux distributions configuration
 * Feature: 009-cross-platform-support
 */

import { OsFamily, PackageManager } from '../types/platform.js';

export interface DistroConfig {
  family: OsFamily;
  minVersion: string;
  packageManager: PackageManager;
  displayName: string;
}

export const SUPPORTED_DISTROS: Record<string, DistroConfig> = {
  ubuntu: {
    family: OsFamily.DEBIAN,
    minVersion: '22.04',
    packageManager: PackageManager.APT,
    displayName: 'Ubuntu',
  },
  debian: {
    family: OsFamily.DEBIAN,
    minVersion: '11',
    packageManager: PackageManager.APT,
    displayName: 'Debian',
  },
  kali: {
    family: OsFamily.DEBIAN,
    minVersion: '2023',
    packageManager: PackageManager.APT,
    displayName: 'Kali Linux',
  },
  centos: {
    family: OsFamily.RHEL,
    minVersion: '9',
    packageManager: PackageManager.DNF,
    displayName: 'CentOS Stream',
  },
  almalinux: {
    family: OsFamily.RHEL,
    minVersion: '9',
    packageManager: PackageManager.DNF,
    displayName: 'AlmaLinux',
  },
  rocky: {
    family: OsFamily.RHEL,
    minVersion: '9',
    packageManager: PackageManager.DNF,
    displayName: 'Rocky Linux',
  },
  fedora: {
    family: OsFamily.RHEL,
    minVersion: '39',
    packageManager: PackageManager.DNF,
    displayName: 'Fedora',
  },
};

export const PRIVATE_IP_RANGES = [/^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./];

export const SUPPORTED_DISTRO_IDS = Object.keys(SUPPORTED_DISTROS);

export function isDistroSupported(distroId: string): boolean {
  return distroId.toLowerCase() in SUPPORTED_DISTROS;
}

export function getDistroConfig(distroId: string): DistroConfig | undefined {
  return SUPPORTED_DISTROS[distroId.toLowerCase()];
}
