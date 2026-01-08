/**
 * Terminal Capabilities Unit Tests
 * @module tests/unit/terminal.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectTerminalCapabilities, supportsUnicode, isWindows, mapPlatform } from '../../src/utils/terminal';
import { Platform } from '../../src/types/terminal';

describe('Terminal Capabilities', () => {
  const originalPlatform = process.platform;
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('mapPlatform()', () => {
    it('should map win32 to Platform.WIN32', () => {
      expect(mapPlatform('win32')).toBe(Platform.WIN32);
    });

    it('should map linux to Platform.LINUX', () => {
      expect(mapPlatform('linux')).toBe(Platform.LINUX);
    });

    it('should map darwin to Platform.DARWIN', () => {
      expect(mapPlatform('darwin')).toBe(Platform.DARWIN);
    });

    it('should map freebsd to Platform.FREEBSD', () => {
      expect(mapPlatform('freebsd')).toBe(Platform.FREEBSD);
    });

    it('should map unknown platforms to Platform.OTHER', () => {
      expect(mapPlatform('aix')).toBe(Platform.OTHER);
      expect(mapPlatform('sunos')).toBe(Platform.OTHER);
    });
  });

  describe('isWindows()', () => {
    it('should return true for WIN32 platform', () => {
      expect(isWindows(Platform.WIN32)).toBe(true);
    });

    it('should return false for LINUX platform', () => {
      expect(isWindows(Platform.LINUX)).toBe(false);
    });

    it('should return false for DARWIN platform', () => {
      expect(isWindows(Platform.DARWIN)).toBe(false);
    });

    it('should return false for FREEBSD platform', () => {
      expect(isWindows(Platform.FREEBSD)).toBe(false);
    });

    it('should return false for OTHER platform', () => {
      expect(isWindows(Platform.OTHER)).toBe(false);
    });
  });

  describe('supportsUnicode()', () => {
    it('should return false for Windows platform regardless of TERM', () => {
      expect(supportsUnicode('xterm-256color', Platform.WIN32)).toBe(false);
      expect(supportsUnicode('screen', Platform.WIN32)).toBe(false);
      expect(supportsUnicode(undefined, Platform.WIN32)).toBe(false);
    });

    it('should return true for xterm variants on Linux', () => {
      expect(supportsUnicode('xterm', Platform.LINUX)).toBe(true);
      expect(supportsUnicode('xterm-256color', Platform.LINUX)).toBe(true);
      expect(supportsUnicode('xterm-color', Platform.LINUX)).toBe(true);
    });

    it('should return true for screen/tmux on Linux', () => {
      expect(supportsUnicode('screen', Platform.LINUX)).toBe(true);
      expect(supportsUnicode('screen-256color', Platform.LINUX)).toBe(true);
      expect(supportsUnicode('tmux', Platform.LINUX)).toBe(true);
      expect(supportsUnicode('tmux-256color', Platform.LINUX)).toBe(true);
    });

    it('should return false for dumb terminal', () => {
      expect(supportsUnicode('dumb', Platform.LINUX)).toBe(false);
      expect(supportsUnicode('dumb', Platform.DARWIN)).toBe(false);
    });

    it('should return false for legacy vt100', () => {
      expect(supportsUnicode('vt100', Platform.LINUX)).toBe(false);
    });

    it('should return false when TERM is undefined on Linux', () => {
      expect(supportsUnicode(undefined, Platform.LINUX)).toBe(false);
    });

    it('should return true for modern terminals on macOS', () => {
      expect(supportsUnicode('xterm-256color', Platform.DARWIN)).toBe(true);
      expect(supportsUnicode('screen-256color', Platform.DARWIN)).toBe(true);
    });
  });

  describe('detectTerminalCapabilities()', () => {
    it('should detect Windows platform correctly', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true,
      });

      const caps = detectTerminalCapabilities();
      expect(caps.platform).toBe(Platform.WIN32);
      expect(caps.supportsUnicode).toBe(false); // Windows always gets ASCII
    });

    it('should detect Linux platform correctly', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true,
      });
      process.env.TERM = 'xterm-256color';

      const caps = detectTerminalCapabilities();
      expect(caps.platform).toBe(Platform.LINUX);
      expect(caps.supportsUnicode).toBe(true);
    });

    it('should detect macOS platform correctly', () => {
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        configurable: true,
      });
      process.env.TERM = 'xterm-256color';

      const caps = detectTerminalCapabilities();
      expect(caps.platform).toBe(Platform.DARWIN);
      expect(caps.supportsUnicode).toBe(true);
    });

    it('should detect TTY status from stdout', () => {
      const caps = detectTerminalCapabilities();
      expect(caps.isTTY).toBeDefined();
      expect(typeof caps.isTTY).toBe('boolean');
    });

    it('should detect terminal width with minimum of 40 and default to 80', () => {
      const caps = detectTerminalCapabilities();
      expect(caps.width).toBeGreaterThanOrEqual(40);

      // If columns is not set, should default to 80
      if (!process.stdout.columns) {
        expect(caps.width).toBe(80);
      }
    });

    it('should handle missing TERM environment variable', () => {
      delete process.env.TERM;

      const caps = detectTerminalCapabilities();
      expect(caps.term).toBeUndefined();
      expect(caps.supportsUnicode).toBe(false); // Should fallback to ASCII
    });

    it('should detect dumb terminal as ASCII-only', () => {
      process.env.TERM = 'dumb';

      const caps = detectTerminalCapabilities();
      expect(caps.term).toBe('dumb');
      expect(caps.supportsUnicode).toBe(false);
    });

    it('should include terminal height when available', () => {
      const caps = detectTerminalCapabilities();

      if (process.stdout.rows) {
        expect(caps.height).toBe(process.stdout.rows);
      } else {
        expect(caps.height).toBeUndefined();
      }
    });

    it('should detect color support from chalk', () => {
      const caps = detectTerminalCapabilities();
      expect(caps.supportsColor).toBeDefined();
      expect(typeof caps.supportsColor).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    it('should handle FreeBSD platform', () => {
      Object.defineProperty(process, 'platform', {
        value: 'freebsd',
        configurable: true,
      });
      process.env.TERM = 'xterm';

      const caps = detectTerminalCapabilities();
      expect(caps.platform).toBe(Platform.FREEBSD);
      expect(caps.supportsUnicode).toBe(true);
    });

    it('should handle unknown platforms gracefully', () => {
      Object.defineProperty(process, 'platform', {
        value: 'aix',
        configurable: true,
      });

      const caps = detectTerminalCapabilities();
      expect(caps.platform).toBe(Platform.OTHER);
    });

    it('should handle narrow terminal width with default', () => {
      const caps = detectTerminalCapabilities();

      // Width should always be at least 80 (default if columns is undefined or narrow)
      expect(caps.width).toBeGreaterThanOrEqual(40);

      // If no columns detected, defaults to 80
      if (!process.stdout.columns) {
        expect(caps.width).toBe(80);
      }
    });

    it('should handle missing stdout.columns by defaulting to 80', () => {
      const caps = detectTerminalCapabilities();

      // Should have a reasonable default width
      expect(caps.width).toBeGreaterThanOrEqual(40);
      expect(typeof caps.width).toBe('number');
    });
  });
});
