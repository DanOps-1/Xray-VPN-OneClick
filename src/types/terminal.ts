/**
 * Terminal-related type definitions
 * @module types/terminal
 */

/**
 * Operating system platform enumeration
 */
/* eslint-disable no-unused-vars */
export enum Platform {
  WIN32 = 'win32',
  LINUX = 'linux',
  DARWIN = 'darwin',
  FREEBSD = 'freebsd',
  OTHER = 'other',
}
/* eslint-enable no-unused-vars */

/**
 * Terminal capabilities interface
 * Represents the detected capabilities and features of the current terminal
 */
export interface TerminalCapabilities {
  /** Whether the current output is a TTY (interactive terminal) */
  isTTY: boolean;

  /** Whether the terminal supports color output */
  supportsColor: boolean;

  /** Whether the terminal supports Unicode characters */
  supportsUnicode: boolean;

  /** Terminal width in columns */
  width: number;

  /** Terminal height in rows (optional) */
  height?: number;

  /** Operating system platform */
  platform: Platform;

  /** TERM environment variable value (optional) */
  term?: string;
}
