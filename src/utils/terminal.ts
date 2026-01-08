/**
 * Terminal Capability Detection
 * @module utils/terminal
 *
 * Provides functions to detect terminal capabilities for adaptive output formatting.
 */

import chalk from 'chalk';
import { Platform, TerminalCapabilities } from '../types/terminal';

/**
 * Detect current terminal capabilities
 * @returns Terminal capabilities object with detected features
 */
export function detectTerminalCapabilities(): TerminalCapabilities {
  const platform = mapPlatform(process.platform);
  const isTTY = process.stdout.isTTY || false;
  const term = process.env.TERM;

  return {
    isTTY,
    supportsColor: chalk.level > 0,
    supportsUnicode: supportsUnicode(term, platform),
    width: process.stdout.columns || 80,
    height: process.stdout.rows,
    platform,
    term,
  };
}

/**
 * Check if given platform is Windows
 * @param platform - Platform to check
 * @returns True if platform is Windows
 */
export function isWindows(platform: Platform): boolean {
  return platform === Platform.WIN32;
}

/**
 * Determine if terminal supports Unicode characters
 * @param term - TERM environment variable value
 * @param platform - Operating system platform
 * @returns True if Unicode is supported
 */
export function supportsUnicode(term: string | undefined, platform: Platform): boolean {
  // Windows CMD typically doesn't support Unicode well
  if (platform === Platform.WIN32) {
    return false;
  }

  // No TERM variable means no Unicode support
  if (!term) {
    return false;
  }

  // Dumb terminals don't support Unicode
  if (term === 'dumb') {
    return false;
  }

  // Legacy terminals don't support Unicode
  if (term === 'vt100') {
    return false;
  }

  // Modern terminals (xterm, screen, tmux variants) support Unicode
  if (term.startsWith('xterm') || term.startsWith('screen') || term.startsWith('tmux')) {
    return true;
  }

  // Default to false for unknown terminals to be safe
  return false;
}

/**
 * Map Node.js platform string to Platform enum
 * @param nodePlatform - process.platform value
 * @returns Platform enum value
 */
export function mapPlatform(nodePlatform: string): Platform {
  switch (nodePlatform) {
    case 'win32':
      return Platform.WIN32;
    case 'linux':
      return Platform.LINUX;
    case 'darwin':
      return Platform.DARWIN;
    case 'freebsd':
      return Platform.FREEBSD;
    default:
      return Platform.OTHER;
  }
}
