/**
 * Icon Resolver Unit Tests
 * @module tests/unit/icons.test
 */

import { describe, it, expect } from 'vitest';
import { resolveIcon, getStatusIndicator, getMenuIcon, resolveSpecialIcon } from '../../src/utils/icons';
import { LogLevel } from '../../src/utils/logger';
import { Platform, TerminalCapabilities } from '../../src/types/terminal';

describe('Icon Resolver', () => {
  const asciiCapabilities: TerminalCapabilities = {
    isTTY: true,
    supportsColor: false,
    supportsUnicode: false,
    width: 80,
    platform: Platform.WIN32,
  };

  const unicodeCapabilities: TerminalCapabilities = {
    isTTY: true,
    supportsColor: true,
    supportsUnicode: true,
    width: 120,
    platform: Platform.LINUX,
  };

  describe('resolveIcon()', () => {
    it('should return ASCII indicators for terminals without Unicode support', () => {
      expect(resolveIcon(LogLevel.SUCCESS, asciiCapabilities)).toBe('[OK]');
      expect(resolveIcon(LogLevel.ERROR, asciiCapabilities)).toBe('[ERROR]');
      expect(resolveIcon(LogLevel.WARN, asciiCapabilities)).toBe('[WARN]');
      expect(resolveIcon(LogLevel.INFO, asciiCapabilities)).toBe('[INFO]');
      expect(resolveIcon(LogLevel.DEBUG, asciiCapabilities)).toBe('[DEBUG]');
    });

    it('should return Unicode symbols for terminals with Unicode support', () => {
      expect(resolveIcon(LogLevel.SUCCESS, unicodeCapabilities)).toBe('✓');
      expect(resolveIcon(LogLevel.ERROR, unicodeCapabilities)).toBe('✗');
      expect(resolveIcon(LogLevel.WARN, unicodeCapabilities)).toBe('!');
      expect(resolveIcon(LogLevel.INFO, unicodeCapabilities)).toBe('i');
      expect(resolveIcon(LogLevel.DEBUG, unicodeCapabilities)).toBe('·');
    });

    it('should handle Windows platform (no Unicode)', () => {
      const winCapabilities: TerminalCapabilities = {
        ...unicodeCapabilities,
        platform: Platform.WIN32,
        supportsUnicode: false,
      };

      expect(resolveIcon(LogLevel.SUCCESS, winCapabilities)).toBe('[OK]');
    });
  });

  describe('resolveSpecialIcon()', () => {
    it('should resolve special icons for ASCII terminals', () => {
      expect(resolveSpecialIcon('LOADING', asciiCapabilities)).toBe('[...]');
      expect(resolveSpecialIcon('PROGRESS', asciiCapabilities)).toBe('[>>]');
      expect(resolveSpecialIcon('HINT', asciiCapabilities)).toBe('[TIP]');
    });

    it('should resolve special icons for Unicode terminals', () => {
      expect(resolveSpecialIcon('LOADING', unicodeCapabilities)).toBe('...');
      expect(resolveSpecialIcon('PROGRESS', unicodeCapabilities)).toBe('>');
      expect(resolveSpecialIcon('HINT', unicodeCapabilities)).toBe('*');
    });
  });

  describe('getStatusIndicator()', () => {
    it('should return complete indicator object for valid log levels', () => {
      const successIndicator = getStatusIndicator(LogLevel.SUCCESS);
      expect(successIndicator.level).toBe(LogLevel.SUCCESS);
      expect(successIndicator.unicode).toBe('✓');
      expect(successIndicator.ascii).toBe('[OK]');
      expect(successIndicator.color).toBe('green');
    });

    it('should return error indicator with correct properties', () => {
      const errorIndicator = getStatusIndicator(LogLevel.ERROR);
      expect(errorIndicator.level).toBe(LogLevel.ERROR);
      expect(errorIndicator.unicode).toBe('✗');
      expect(errorIndicator.ascii).toBe('[ERROR]');
      expect(errorIndicator.color).toBe('red');
    });

    it('should throw error for invalid log level', () => {
      expect(() => getStatusIndicator('invalid' as LogLevel)).toThrow('Invalid log level');
    });
  });

  describe('getMenuIcon()', () => {
    it('should return menu icon object for valid keys', () => {
      const startIcon = getMenuIcon('START');
      expect(startIcon.text).toBe('[启动]');
      expect(startIcon.emoji).toBe('🚀');
    });

    it('should return menu icon for lowercase keys', () => {
      const stopIcon = getMenuIcon('stop');
      expect(stopIcon.text).toBe('[停止]');
    });

    it('should return all menu icons correctly', () => {
      expect(getMenuIcon('STATUS').text).toBe('[查看]');
      expect(getMenuIcon('START').text).toBe('[启动]');
      expect(getMenuIcon('STOP').text).toBe('[停止]');
      expect(getMenuIcon('RESTART').text).toBe('[重启]');
      expect(getMenuIcon('USER').text).toBe('[用户]');
      expect(getMenuIcon('CONFIG').text).toBe('[配置]');
      expect(getMenuIcon('LOGS').text).toBe('[日志]');
      expect(getMenuIcon('EXIT').text).toBe('[退出]');
    });

    it('should throw error for unknown menu key', () => {
      expect(() => getMenuIcon('UNKNOWN')).toThrow('Unknown menu icon key');
    });
  });

  describe('Menu Icon Format', () => {
    it('should ensure all menu icons follow [标签] format', () => {
      const keys = ['STATUS', 'START', 'STOP', 'RESTART', 'USER', 'CONFIG', 'LOGS', 'EXIT'];

      keys.forEach((key) => {
        const icon = getMenuIcon(key);
        expect(icon.text).toMatch(/^\[.+\]$/);  // Must be wrapped in brackets
      });
    });

    it('should ensure all menu icons are ≤6 characters', () => {
      const keys = ['STATUS', 'START', 'STOP', 'RESTART', 'USER', 'CONFIG', 'LOGS', 'EXIT'];

      keys.forEach((key) => {
        const icon = getMenuIcon(key);
        expect(icon.text.length).toBeLessThanOrEqual(6);
      });
    });
  });
});
