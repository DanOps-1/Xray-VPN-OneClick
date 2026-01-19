/**
 * OS Detection Unit Tests
 * Feature: 009-cross-platform-support
 */

import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_DISTROS,
  isDistroSupported,
  getDistroConfig,
} from '../../src/constants/supported-distros.js';
import { OsFamily, PackageManager } from '../../src/types/platform.js';

describe('Supported Distros', () => {
  it('should have all expected distributions', () => {
    const expectedDistros = ['ubuntu', 'debian', 'kali', 'centos', 'almalinux', 'rocky', 'fedora'];
    expectedDistros.forEach((distro) => {
      expect(SUPPORTED_DISTROS[distro]).toBeDefined();
    });
  });

  it('should have correct family for Debian-based distros', () => {
    expect(SUPPORTED_DISTROS.ubuntu.family).toBe(OsFamily.DEBIAN);
    expect(SUPPORTED_DISTROS.debian.family).toBe(OsFamily.DEBIAN);
    expect(SUPPORTED_DISTROS.kali.family).toBe(OsFamily.DEBIAN);
  });

  it('should have correct family for RHEL-based distros', () => {
    expect(SUPPORTED_DISTROS.centos.family).toBe(OsFamily.RHEL);
    expect(SUPPORTED_DISTROS.almalinux.family).toBe(OsFamily.RHEL);
    expect(SUPPORTED_DISTROS.rocky.family).toBe(OsFamily.RHEL);
    expect(SUPPORTED_DISTROS.fedora.family).toBe(OsFamily.RHEL);
  });

  it('should have correct package managers', () => {
    expect(SUPPORTED_DISTROS.ubuntu.packageManager).toBe(PackageManager.APT);
    expect(SUPPORTED_DISTROS.centos.packageManager).toBe(PackageManager.DNF);
  });
});

describe('isDistroSupported', () => {
  it('should return true for supported distros', () => {
    expect(isDistroSupported('ubuntu')).toBe(true);
    expect(isDistroSupported('centos')).toBe(true);
    expect(isDistroSupported('fedora')).toBe(true);
  });

  it('should return false for unsupported distros', () => {
    expect(isDistroSupported('arch')).toBe(false);
    expect(isDistroSupported('gentoo')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isDistroSupported('Ubuntu')).toBe(true);
    expect(isDistroSupported('CENTOS')).toBe(true);
  });
});

describe('getDistroConfig', () => {
  it('should return config for supported distros', () => {
    const ubuntuConfig = getDistroConfig('ubuntu');
    expect(ubuntuConfig).toBeDefined();
    expect(ubuntuConfig?.minVersion).toBe('22.04');
  });

  it('should return undefined for unsupported distros', () => {
    expect(getDistroConfig('arch')).toBeUndefined();
  });
});
