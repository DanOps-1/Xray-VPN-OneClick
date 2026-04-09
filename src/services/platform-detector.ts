/**
 * Platform detection service
 * Feature: 009-cross-platform-support
 */

import { PlatformInfo } from '../types/platform.js';
import { detectOperatingSystem } from '../utils/os-detection.js';
import { detectFirewall } from '../utils/firewall.js';
import { detectNetwork } from '../utils/network.js';
import { ContainerType, SelinuxStatus } from '../types/platform.js';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

/**
 * Detect container environment
 */
function detectContainer(): { type: ContainerType; isContainer: boolean } {
  try {
    const fs = { existsSync, readFileSync };
    // Check for Docker
    if (fs.existsSync('/.dockerenv')) {
      return { type: ContainerType.DOCKER, isContainer: true };
    }

    // Check cgroup for container hints
    if (fs.existsSync('/proc/1/cgroup')) {
      const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf-8');
      if (cgroup.includes('docker')) {
        return { type: ContainerType.DOCKER, isContainer: true };
      }
      if (cgroup.includes('lxc')) {
        return { type: ContainerType.LXC, isContainer: true };
      }
    }

    // Check for OpenVZ
    if (fs.existsSync('/proc/vz') && !fs.existsSync('/proc/bc')) {
      return { type: ContainerType.OPENVZ, isContainer: true };
    }
  } catch {
    // Ignore errors
  }

  return { type: ContainerType.NONE, isContainer: false };
}

/**
 * Detect SELinux status
 */
function detectSelinux(): SelinuxStatus {
  try {
    const output = execSync('getenforce 2>/dev/null', { encoding: 'utf-8' }).trim();
    switch (output) {
      case 'Enforcing':
        return SelinuxStatus.ENFORCING;
      case 'Permissive':
        return SelinuxStatus.PERMISSIVE;
      default:
        return SelinuxStatus.DISABLED;
    }
  } catch {
    return SelinuxStatus.DISABLED;
  }
}

/**
 * Check if systemd is available
 */
function hasSystemd(): boolean {
  try {
    execSync('systemctl --version', { encoding: 'utf-8' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect current shell
 */
function detectShell(): { shell: string; isCompatible: boolean } {
  const shell = process.env.SHELL || '/bin/sh';
  const shellName = shell.split('/').pop() || 'sh';
  const isCompatible = ['bash', 'zsh'].includes(shellName);
  return { shell: shellName, isCompatible };
}

/**
 * Get complete platform information
 */
export function detectPlatform(): PlatformInfo | null {
  const os = detectOperatingSystem();
  if (!os) return null;

  const container = detectContainer();
  const shellInfo = detectShell();

  return {
    os,
    environment: {
      shell: shellInfo.shell,
      isCompatibleShell: shellInfo.isCompatible,
      containerType: container.type,
      isContainer: container.isContainer,
      selinuxStatus: detectSelinux(),
      hasSystemd: hasSystemd(),
    },
    network: detectNetwork(),
    firewall: detectFirewall(),
  };
}
