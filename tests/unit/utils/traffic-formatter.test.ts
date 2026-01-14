/**
 * traffic-formatter - Unit Tests (T008)
 *
 * Tests traffic formatting and parsing utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatTraffic,
  parseTraffic,
  calculateUsagePercent,
  getAlertLevel,
  formatRemaining,
  formatUsageSummary,
} from '../../../src/utils/traffic-formatter';

describe('formatTraffic', () => {
  it('should format 0 bytes', () => {
    const result = formatTraffic(0);
    expect(result.value).toBe(0);
    expect(result.unit).toBe('B');
    expect(result.display).toBe('0 B');
  });

  it('should format negative bytes as unlimited', () => {
    const result = formatTraffic(-1);
    expect(result.display).toBe('无限制');
  });

  it('should format bytes correctly', () => {
    const result = formatTraffic(500);
    expect(result.value).toBe(500);
    expect(result.unit).toBe('B');
    expect(result.display).toBe('500.00 B');
  });

  it('should format KB correctly', () => {
    const result = formatTraffic(1024);
    expect(result.value).toBe(1);
    expect(result.unit).toBe('KB');
    expect(result.display).toBe('1.00 KB');
  });

  it('should format MB correctly', () => {
    const result = formatTraffic(1024 * 1024);
    expect(result.value).toBe(1);
    expect(result.unit).toBe('MB');
    expect(result.display).toBe('1.00 MB');
  });

  it('should format GB correctly', () => {
    const result = formatTraffic(1024 ** 3);
    expect(result.value).toBe(1);
    expect(result.unit).toBe('GB');
    expect(result.display).toBe('1.00 GB');
  });

  it('should format TB correctly', () => {
    const result = formatTraffic(1024 ** 4);
    expect(result.value).toBe(1);
    expect(result.unit).toBe('TB');
    expect(result.display).toBe('1.00 TB');
  });

  it('should format fractional values', () => {
    const result = formatTraffic(1.5 * 1024 ** 3);
    expect(result.value).toBeCloseTo(1.5, 2);
    expect(result.unit).toBe('GB');
    expect(result.display).toBe('1.50 GB');
  });
});

describe('parseTraffic', () => {
  it('should parse bytes without unit', () => {
    expect(parseTraffic('1024')).toBe(1024);
  });

  it('should parse KB', () => {
    expect(parseTraffic('1KB')).toBe(1024);
    expect(parseTraffic('1 KB')).toBe(1024);
    expect(parseTraffic('1kb')).toBe(1024);
  });

  it('should parse MB', () => {
    expect(parseTraffic('1MB')).toBe(1024 ** 2);
    expect(parseTraffic('10 MB')).toBe(10 * 1024 ** 2);
  });

  it('should parse GB', () => {
    expect(parseTraffic('1GB')).toBe(1024 ** 3);
    expect(parseTraffic('5 GB')).toBe(5 * 1024 ** 3);
  });

  it('should parse TB', () => {
    expect(parseTraffic('1TB')).toBe(1024 ** 4);
  });

  it('should parse fractional values', () => {
    expect(parseTraffic('1.5GB')).toBe(Math.floor(1.5 * 1024 ** 3));
  });

  it('should parse unlimited values', () => {
    expect(parseTraffic('无限制')).toBe(-1);
    expect(parseTraffic('UNLIMITED')).toBe(-1);
    expect(parseTraffic('-1')).toBe(-1);
  });

  it('should return -1 for invalid input', () => {
    expect(parseTraffic('invalid')).toBe(-1);
    expect(parseTraffic('')).toBe(-1);
    expect(parseTraffic('abc GB')).toBe(-1);
  });
});

describe('calculateUsagePercent', () => {
  it('should calculate percentage correctly', () => {
    expect(calculateUsagePercent(50, 100)).toBe(50);
    expect(calculateUsagePercent(75, 100)).toBe(75);
  });

  it('should return 0 for unlimited quota', () => {
    expect(calculateUsagePercent(1000, -1)).toBe(0);
    expect(calculateUsagePercent(1000, 0)).toBe(0);
  });

  it('should cap at 100%', () => {
    expect(calculateUsagePercent(150, 100)).toBe(100);
  });

  it('should handle large numbers', () => {
    const used = 5 * 1024 ** 3; // 5 GB
    const quota = 10 * 1024 ** 3; // 10 GB
    expect(calculateUsagePercent(used, quota)).toBe(50);
  });
});

describe('getAlertLevel', () => {
  it('should return normal for low usage', () => {
    expect(getAlertLevel(0)).toBe('normal');
    expect(getAlertLevel(50)).toBe('normal');
    expect(getAlertLevel(79)).toBe('normal');
  });

  it('should return warning for 80-99%', () => {
    expect(getAlertLevel(80)).toBe('warning');
    expect(getAlertLevel(90)).toBe('warning');
    expect(getAlertLevel(99)).toBe('warning');
  });

  it('should return exceeded for 100%+', () => {
    expect(getAlertLevel(100)).toBe('exceeded');
    expect(getAlertLevel(150)).toBe('exceeded');
  });
});

describe('formatRemaining', () => {
  it('should format remaining traffic', () => {
    const result = formatRemaining(5 * 1024 ** 3, 10 * 1024 ** 3);
    expect(result).toBe('5.00 GB');
  });

  it('should return 0 when exceeded', () => {
    const result = formatRemaining(15 * 1024 ** 3, 10 * 1024 ** 3);
    expect(result).toBe('0 B');
  });

  it('should return unlimited for negative quota', () => {
    expect(formatRemaining(1000, -1)).toBe('无限制');
  });
});

describe('formatUsageSummary', () => {
  it('should format usage summary with percentage', () => {
    const result = formatUsageSummary(5 * 1024 ** 3, 10 * 1024 ** 3);
    expect(result).toContain('5.00 GB');
    expect(result).toContain('10.00 GB');
    expect(result).toContain('50%');
  });

  it('should format unlimited quota', () => {
    const result = formatUsageSummary(5 * 1024 ** 3, -1);
    expect(result).toContain('5.00 GB');
    expect(result).toContain('无限制');
  });
});
