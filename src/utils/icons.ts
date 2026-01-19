/**
 * Icon Resolver
 * @module utils/icons
 *
 * Resolves appropriate icons based on terminal capabilities and context.
 */

import { TerminalCapabilities } from '../types/terminal';
import { statusIcons, menuIcons } from '../constants/ui-symbols';

// Import LogLevel type only to avoid circular dependency
import type { LogLevel } from './logger';

/**
 * Status indicator with both Unicode and ASCII representations
 */
export interface StatusIndicator {
  level: string; // Using string instead of LogLevel enum to avoid circular dependency
  unicode: string;
  ascii: string;
  color: 'green' | 'red' | 'yellow' | 'cyan' | 'blue' | 'gray';
}

/**
 * Menu icon with emoji (deprecated) and text representations
 */
export interface MenuIcon {
  emoji?: string;
  text: string;
}

/**
 * Status indicator mappings for all log levels
 */
const STATUS_INDICATOR_MAP: Record<string, StatusIndicator> = {
  success: {
    level: 'success',
    unicode: '✓',
    ascii: statusIcons.SUCCESS,
    color: 'green',
  },
  error: {
    level: 'error',
    unicode: '✗',
    ascii: statusIcons.ERROR,
    color: 'red',
  },
  warn: {
    level: 'warn',
    unicode: '!',
    ascii: statusIcons.WARN,
    color: 'yellow',
  },
  info: {
    level: 'info',
    unicode: 'i',
    ascii: statusIcons.INFO,
    color: 'cyan',
  },
  debug: {
    level: 'debug',
    unicode: '·',
    ascii: statusIcons.DEBUG,
    color: 'gray',
  },
};

/**
 * Additional status indicators for special states
 */
const EXTRA_INDICATORS: Record<string, StatusIndicator> = {
  LOADING: {
    level: 'info',
    unicode: '...',
    ascii: statusIcons.LOADING,
    color: 'cyan',
  },
  PROGRESS: {
    level: 'info',
    unicode: '>',
    ascii: statusIcons.PROGRESS,
    color: 'blue',
  },
  HINT: {
    level: 'info',
    unicode: '*',
    ascii: statusIcons.HINT,
    color: 'cyan',
  },
};

/**
 * Menu icon mappings
 */
const MENU_ICON_MAP: Record<string, MenuIcon> = {
  STATUS: { emoji: '📊', text: menuIcons.STATUS },
  START: { emoji: '🚀', text: menuIcons.START },
  STOP: { emoji: '🛑', text: menuIcons.STOP },
  RESTART: { emoji: '🔄', text: menuIcons.RESTART },
  USER: { emoji: '👥', text: menuIcons.USER },
  CONFIG: { emoji: '⚙️', text: menuIcons.CONFIG },
  LOGS: { emoji: '📝', text: menuIcons.LOGS },
  EXIT: { emoji: '❌', text: menuIcons.EXIT },
};

/**
 * Resolve appropriate icon based on log level and terminal capabilities
 * @param level - Log level
 * @param capabilities - Terminal capabilities
 * @returns Icon string (Unicode or ASCII)
 */
export function resolveIcon(level: LogLevel, capabilities: TerminalCapabilities): string {
  const indicator = STATUS_INDICATOR_MAP[level as string];

  if (!indicator) {
    // Fallback for unknown levels
    return capabilities.supportsUnicode ? '•' : statusIcons.INFO;
  }

  // Use ASCII for terminals that don't support Unicode
  if (!capabilities.supportsUnicode) {
    return indicator.ascii;
  }

  // Use Unicode for modern terminals
  return indicator.unicode;
}

/**
 * Resolve icon for special states (loading, progress, hint)
 * @param state - State name (LOADING, PROGRESS, HINT)
 * @param capabilities - Terminal capabilities
 * @returns Icon string
 */
export function resolveSpecialIcon(
  state: 'LOADING' | 'PROGRESS' | 'HINT',
  capabilities: TerminalCapabilities
): string {
  const indicator = EXTRA_INDICATORS[state];

  if (!indicator) {
    return capabilities.supportsUnicode ? '•' : statusIcons.INFO;
  }

  return capabilities.supportsUnicode ? indicator.unicode : indicator.ascii;
}

/**
 * Get status indicator details for a log level
 * @param level - Log level
 * @returns Status indicator object
 * @throws Error if log level is invalid
 */
export function getStatusIndicator(level: LogLevel): StatusIndicator {
  const indicator = STATUS_INDICATOR_MAP[level as string];

  if (!indicator) {
    throw new Error(`Invalid log level: ${level}`);
  }

  return indicator;
}

/**
 * Get menu icon for a specific key
 * @param key - Menu icon key (STATUS, START, STOP, etc.)
 * @returns Menu icon object
 * @throws Error if key is not found
 */
export function getMenuIcon(key: string): MenuIcon {
  const icon = MENU_ICON_MAP[key.toUpperCase()];

  if (!icon) {
    throw new Error(`Unknown menu icon key: ${key}`);
  }

  return icon;
}
