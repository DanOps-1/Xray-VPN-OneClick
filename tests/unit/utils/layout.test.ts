/**
 * Unit tests for layout utility functions
 *
 * Tests display width calculation, column width calculation, and text fitting
 * Feature: 005-ui-layout-expansion
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDisplayWidth,
  calculateColumnWidth,
  fitText,
  renderSeparator,
  renderTable,
  renderSection,
  renderColumns,
  distributeToColumns,
} from '../../../src/utils/layout';
import { validateLayout, validateRegion } from '../../../src/types/layout';
import type { TerminalLayout, ContentRegion } from '../../../src/types/layout';
import { LayoutMode, ContentRegionType } from '../../../src/types/layout';

describe('Layout Utilities', () => {
  describe('calculateDisplayWidth', () => {
    it('should calculate width for pure English text', () => {
      expect(calculateDisplayWidth('Hello World')).toBe(11);
      expect(calculateDisplayWidth('test')).toBe(4);
      expect(calculateDisplayWidth('a')).toBe(1);
    });

    it('should calculate width for pure Chinese text', () => {
      // Chinese characters are 2-width
      expect(calculateDisplayWidth('你好')).toBe(4); // 2 chars * 2
      expect(calculateDisplayWidth('世界')).toBe(4); // 2 chars * 2
      expect(calculateDisplayWidth('中文测试')).toBe(8); // 4 chars * 2
    });

    it('should calculate width for mixed English and Chinese text', () => {
      expect(calculateDisplayWidth('Hello 世界')).toBe(10); // "Hello " = 6, "世界" = 4
      expect(calculateDisplayWidth('测试test')).toBe(8); // "测试" = 4, "test" = 4
      expect(calculateDisplayWidth('[查看] 服务状态')).toBe(15); // "[" = 1, "查看" = 4, "]" = 1, " " = 1, "服务状态态" = 8
    });

    it('should handle empty string', () => {
      expect(calculateDisplayWidth('')).toBe(0);
    });

    it('should handle special characters', () => {
      expect(calculateDisplayWidth('!@#$%')).toBe(5);
      expect(calculateDisplayWidth('├─┤')).toBe(3);
    });
  });

  describe('calculateColumnWidth', () => {
    it('should calculate column width for 2 columns', () => {
      // (120 - (2-1) * 2) / 2 = 118 / 2 = 59
      expect(calculateColumnWidth(120, 2, 2)).toBe(59);
    });

    it('should calculate column width for 3 columns', () => {
      // (150 - (3-1) * 2) / 3 = 146 / 3 = 48.67 -> 48
      expect(calculateColumnWidth(150, 3, 2)).toBe(48);
    });

    it('should handle custom gaps', () => {
      // (120 - (2-1) * 4) / 2 = 116 / 2 = 58
      expect(calculateColumnWidth(120, 2, 4)).toBe(58);
    });

    it('should handle single column (no gap)', () => {
      // (80 - (1-1) * 2) / 1 = 80 / 1 = 80
      expect(calculateColumnWidth(80, 1, 2)).toBe(80);
    });

    it('should round down fractional widths', () => {
      // (100 - (3-1) * 2) / 3 = 96 / 3 = 32
      expect(calculateColumnWidth(100, 3, 2)).toBe(32);
    });
  });

  describe('fitText', () => {
    it('should fit text exactly to width', () => {
      const result = fitText('Hello', 5, 'left');
      expect(calculateDisplayWidth(result)).toBe(5);
      expect(result).toBe('Hello');
    });

    it('should truncate text exceeding width', () => {
      const result = fitText('Hello World', 8, 'left');
      expect(calculateDisplayWidth(result)).toBeLessThanOrEqual(8);
      expect(result).toContain('...');
    });

    it('should pad text shorter than width (left align)', () => {
      const result = fitText('Hi', 10, 'left');
      expect(calculateDisplayWidth(result)).toBe(10);
      expect(result).toBe('Hi        '); // 8 spaces
    });

    it('should pad text shorter than width (center align)', () => {
      const result = fitText('Hi', 10, 'center');
      expect(calculateDisplayWidth(result)).toBe(10);
      // Should have spaces on both sides
      expect(result.trim()).toBe('Hi');
    });

    it('should pad text shorter than width (right align)', () => {
      const result = fitText('Hi', 10, 'right');
      expect(calculateDisplayWidth(result)).toBe(10);
      expect(result).toBe('        Hi'); // 8 spaces
    });

    it('should handle Chinese text truncation', () => {
      const result = fitText('你好世界', 6, 'left'); // 4 chars = 8 width
      expect(calculateDisplayWidth(result)).toBeLessThanOrEqual(6);
    });

    it('should use custom ellipsis', () => {
      const result = fitText('Very long text here', 10, 'left', '…');
      expect(result).toContain('…');
    });
  });

  describe('renderSeparator', () => {
    it('should render separator of specified width', () => {
      const result = renderSeparator(10, '─');
      expect(calculateDisplayWidth(result)).toBe(10);
      expect(result).toBe('─'.repeat(10));
    });

    it('should use default character if not specified', () => {
      const result = renderSeparator(5);
      expect(calculateDisplayWidth(result)).toBe(5);
      expect(result).toBe('─'.repeat(5));
    });

    it('should handle different separator characters', () => {
      expect(renderSeparator(3, '=')).toBe('===');
      expect(renderSeparator(3, '-')).toBe('---');
      expect(renderSeparator(3, '━')).toBe('━━━');
    });

    it('should handle zero width', () => {
      const result = renderSeparator(0);
      expect(result).toBe('');
    });
  });

  describe('validateLayout', () => {
    it('should validate a correct COMPACT layout', () => {
      const layout: TerminalLayout = {
        width: 70,
        height: 24,
        mode: LayoutMode.COMPACT,
        columns: 1,
        regions: [],
        timestamp: Date.now(),
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });

    it('should validate a correct STANDARD layout', () => {
      const layout: TerminalLayout = {
        width: 100,
        height: 30,
        mode: LayoutMode.STANDARD,
        columns: 1,
        regions: [],
        timestamp: Date.now(),
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });

    it('should validate a correct WIDE layout', () => {
      const layout: TerminalLayout = {
        width: 140,
        height: 40,
        mode: LayoutMode.WIDE,
        columns: 2,
        regions: [],
        timestamp: Date.now(),
      };

      expect(() => validateLayout(layout)).not.toThrow();
    });

    it('should reject layout with terminal too small', () => {
      const layout: TerminalLayout = {
        width: 50, // < 60 minimum
        height: 24,
        mode: LayoutMode.COMPACT,
        columns: 1,
        regions: [],
        timestamp: Date.now(),
      };

      expect(() => validateLayout(layout)).toThrow('Terminal too small');
    });

    it('should reject layout with mismatched mode', () => {
      const layout: TerminalLayout = {
        width: 140, // Should be WIDE
        height: 30,
        mode: LayoutMode.STANDARD, // Wrong!
        columns: 1,
        regions: [],
        timestamp: Date.now(),
      };

      expect(() => validateLayout(layout)).toThrow('LayoutMode mismatch');
    });

    it('should reject WIDE layout with columns < 2', () => {
      const layout: TerminalLayout = {
        width: 140,
        height: 30,
        mode: LayoutMode.WIDE,
        columns: 1, // Should be >= 2
        regions: [],
        timestamp: Date.now(),
      };

      expect(() => validateLayout(layout)).toThrow('WIDE mode requires columns >= 2');
    });

    it('should reject non-WIDE layout with columns > 1', () => {
      const layout: TerminalLayout = {
        width: 100,
        height: 30,
        mode: LayoutMode.STANDARD,
        columns: 2, // Should be 1
        regions: [],
        timestamp: Date.now(),
      };

      expect(() => validateLayout(layout)).toThrow('Non-WIDE mode requires columns = 1');
    });
  });

  describe('validateRegion', () => {
    const layout: TerminalLayout = {
      width: 80,
      height: 24,
      mode: LayoutMode.STANDARD,
      columns: 1,
      regions: [],
      timestamp: Date.now(),
    };

    it('should validate a correct region', () => {
      const region: ContentRegion = {
        id: 'test-region',
        type: ContentRegionType.HEADER,
        position: { row: 0, column: 0 },
        size: { width: 80, height: 3 },
        padding: { top: 1, right: 2, bottom: 1, left: 2 },
        showBorder: false,
      };

      expect(() => validateRegion(region, layout)).not.toThrow();
    });

    it('should reject region with negative position', () => {
      const region: ContentRegion = {
        id: 'bad-region',
        type: ContentRegionType.CONTENT,
        position: { row: -1, column: 0 },
        size: { width: 10, height: 5 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        showBorder: false,
      };

      expect(() => validateRegion(region, layout)).toThrow('out of bounds');
    });

    it('should reject region exceeding layout bounds', () => {
      const region: ContentRegion = {
        id: 'oversized',
        type: ContentRegionType.CONTENT,
        position: { row: 20, column: 0 },
        size: { width: 80, height: 10 }, // Exceeds 24 rows
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        showBorder: false,
      };

      expect(() => validateRegion(region, layout)).toThrow('out of bounds');
    });

    it('should reject region with padding too large', () => {
      const region: ContentRegion = {
        id: 'over-padded',
        type: ContentRegionType.CONTENT,
        position: { row: 0, column: 0 },
        size: { width: 10, height: 10 },
        padding: { top: 0, right: 6, bottom: 0, left: 6 }, // 12 >= 10
        showBorder: false,
      };

      expect(() => validateRegion(region, layout)).toThrow('padding');
    });
  });

  describe('renderTable (cli-table3)', () => {
    it('should render table with single border style', () => {
      const result = renderTable(
        [
          { header: 'Name', key: 'name', align: 'left' },
          { header: 'Status', key: 'status', align: 'center' },
        ],
        [
          { name: 'user1', status: 'Active' },
          { name: 'user2', status: 'Inactive' },
        ],
        { borderStyle: 'single' }
      );

      expect(result).toBeDefined();
      expect(result).toContain('Name');
      expect(result).toContain('Status');
      expect(result).toContain('user1');
      expect(result).toContain('Active');
    });

    it('should render table with double border style', () => {
      const result = renderTable([{ header: 'Test', key: 'test' }], [{ test: 'value' }], {
        borderStyle: 'double',
      });

      expect(result).toBeDefined();
      expect(result).toContain('Test');
    });

    it('should render table with compact border style', () => {
      const result = renderTable([{ header: 'Test', key: 'test' }], [{ test: 'value' }], {
        borderStyle: 'compact',
      });

      expect(result).toBeDefined();
      expect(result).toContain('Test');
    });

    it('should handle custom column alignment', () => {
      const result = renderTable(
        [
          { header: 'Left', key: 'left', align: 'left' },
          { header: 'Center', key: 'center', align: 'center' },
          { header: 'Right', key: 'right', align: 'right' },
        ],
        [{ left: 'L', center: 'C', right: 'R' }]
      );

      expect(result).toContain('Left');
      expect(result).toContain('Center');
      expect(result).toContain('Right');
    });

    it('should handle custom column widths', () => {
      const result = renderTable(
        [
          { header: 'Short', key: 'short', width: 10 },
          { header: 'Long Column Name', key: 'long', width: 30 },
        ],
        [{ short: 'A', long: 'B' }]
      );

      expect(result).toBeDefined();
    });

    it('should handle empty data', () => {
      const result = renderTable([{ header: 'Empty', key: 'empty' }], []);

      expect(result).toBeDefined();
      expect(result).toContain('Empty');
    });
  });

  describe('renderSection', () => {
    it('should render section with title and content', () => {
      const result = renderSection('Section Title', 'Section content here', { showBorder: true });

      expect(result).toBeDefined();
      expect(result).toContain('Section Title');
      expect(result).toContain('Section content here');
    });

    it('should render section without border', () => {
      const result = renderSection('Title', 'Content', { showBorder: false });

      expect(result).toBeDefined();
      expect(result).toContain('Title');
      expect(result).toContain('Content');
    });

    it('should render section with multi-line content', () => {
      const result = renderSection('Multi-line', 'Line 1\nLine 2\nLine 3', { showBorder: true });

      expect(result).toContain('Multi-line');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
    });

    it('should apply padding to section', () => {
      const result = renderSection('Padded', 'Content', {
        showBorder: false,
        padding: { top: 1, right: 2, bottom: 1, left: 2 },
      });

      expect(result).toBeDefined();
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Has padding lines
    });

    it('should handle Chinese characters in section', () => {
      const result = renderSection('服务状态', '运行中', { showBorder: true });

      expect(result).toContain('服务状态');
      expect(result).toContain('运行中');
    });
  });

  describe('distributeToColumns', () => {
    it('should distribute items to 2 columns evenly', () => {
      const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
      const result = distributeToColumns(items, 2);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(['Item 1', 'Item 2']);
      expect(result[1]).toEqual(['Item 3', 'Item 4']);
    });

    it('should distribute items to 3 columns', () => {
      const items = ['A', 'B', 'C', 'D', 'E', 'F'];
      const result = distributeToColumns(items, 3);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(['A', 'B']);
      expect(result[1]).toEqual(['C', 'D']);
      expect(result[2]).toEqual(['E', 'F']);
    });

    it('should handle uneven distribution', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const result = distributeToColumns(items, 2);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(['A', 'B', 'C']);
      expect(result[1]).toEqual(['D', 'E']);
    });

    it('should handle single column', () => {
      const items = ['A', 'B', 'C'];
      const result = distributeToColumns(items, 1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(['A', 'B', 'C']);
    });

    it('should handle more columns than items', () => {
      const items = ['A', 'B'];
      const result = distributeToColumns(items, 3);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(['A']);
      expect(result[1]).toEqual(['B']);
      expect(result[2]).toEqual([]);
    });
  });

  describe('renderColumns', () => {
    it('should render 2 columns side by side', () => {
      const columns = [
        ['Column 1 Line 1', 'Column 1 Line 2'],
        ['Column 2 Line 1', 'Column 2 Line 2'],
      ];

      const result = renderColumns(columns, 80, 2);

      expect(result).toBeDefined();
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(0);
      expect(result).toContain('Column 1');
      expect(result).toContain('Column 2');
    });

    it('should render 3 columns with custom gap', () => {
      const columns = [
        ['A1', 'A2'],
        ['B1', 'B2'],
        ['C1', 'C2'],
      ];

      const result = renderColumns(columns, 120, 4);

      expect(result).toBeDefined();
      expect(result).toContain('A1');
      expect(result).toContain('B1');
      expect(result).toContain('C1');
    });

    it('should handle columns with different heights', () => {
      const columns = [['Short'], ['Line 1', 'Line 2', 'Line 3']];

      const result = renderColumns(columns, 80, 2);

      expect(result).toBeDefined();
      const lines = result.split('\n');
      expect(lines.length).toBe(3); // Should match tallest column
    });

    it('should handle empty columns', () => {
      const columns = [['Content'], [], ['More content']];

      const result = renderColumns(columns, 120, 2);

      expect(result).toBeDefined();
    });

    it('should handle Chinese text in columns', () => {
      const columns = [
        ['服务状态', '运行中'],
        ['用户数量', '5'],
      ];

      const result = renderColumns(columns, 80, 2);

      expect(result).toContain('服务状态');
      expect(result).toContain('用户数量');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum terminal size (60x20)', () => {
      const width = 60;
      const text = 'Test content';
      const result = fitText(text, width, 'left');
      expect(calculateDisplayWidth(result)).toBeLessThanOrEqual(width);
    });

    it('should handle extremely large terminal (300 columns)', () => {
      const width = 300;
      const separator = renderSeparator(width);
      expect(calculateDisplayWidth(separator)).toBe(width);
    });

    it('should handle empty text input', () => {
      expect(calculateDisplayWidth('')).toBe(0);
      expect(fitText('', 10, 'left')).toBe(' '.repeat(10));
    });

    it('should handle single character widths correctly', () => {
      expect(calculateDisplayWidth('a')).toBe(1);
      expect(calculateDisplayWidth('中')).toBe(2);
    });

    it('should handle very long Chinese text', () => {
      const longText = '中文'.repeat(100); // 200 chars, 400 display width
      const fitted = fitText(longText, 50, 'left');
      expect(calculateDisplayWidth(fitted)).toBeLessThanOrEqual(50);
    });

    it('should handle column width calculation with zero gap', () => {
      const width = calculateColumnWidth(100, 2, 0);
      expect(width).toBe(50); // (100 - 0) / 2 = 50
    });

    it('should handle single column (no distribution needed)', () => {
      const items = ['A', 'B', 'C'];
      const columns = distributeToColumns(items, 1);
      expect(columns).toHaveLength(1);
      expect(columns[0]).toEqual(items);
    });

    it('should handle more columns than items', () => {
      const items = ['A', 'B'];
      const columns = distributeToColumns(items, 5);
      expect(columns).toHaveLength(5);
      expect(columns[0]).toEqual(['A']);
      expect(columns[1]).toEqual(['B']);
      expect(columns[2]).toEqual([]);
      expect(columns[3]).toEqual([]);
      expect(columns[4]).toEqual([]);
    });
  });
});
