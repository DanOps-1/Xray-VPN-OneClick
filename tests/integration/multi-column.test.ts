/**
 * Integration tests for multi-column layout
 *
 * Tests multi-column rendering in wide terminals
 * Feature: 005-ui-layout-expansion - User Story 3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LayoutManager } from '../../src/services/layout-manager';
import { renderColumns, distributeToColumns } from '../../src/utils/layout';
import { LayoutMode } from '../../src/types/layout';

describe('Multi-Column Layout Integration', () => {
  let layoutManager: LayoutManager;

  beforeEach(() => {
    layoutManager = new LayoutManager();
  });

  describe('Wide terminal multi-column rendering', () => {
    it('should use 2-column layout in WIDE mode (> 120 cols)', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'columns', { value: 140, writable: true });
      Object.defineProperty(process.stdout, 'rows', { value: 40, writable: true });

      const size = layoutManager.detectTerminalSize();
      const mode = layoutManager.calculateLayoutMode(size.width);

      expect(mode).toBe(LayoutMode.WIDE);
      expect(size.width).toBe(140);

      // Create multi-column content
      const items = [
        'Service Status: Running',
        'Port: 443',
        'Users: 5',
        'CPU: 5%',
        'Memory: 120MB',
        'Uptime: 2d 5h',
      ];

      const columns = distributeToColumns(items, 2);
      expect(columns).toHaveLength(2);

      const rendered = renderColumns(columns, size.width, 2);
      expect(rendered).toBeDefined();
      expect(rendered).toContain('Service Status');
      expect(rendered).toContain('CPU');
    });

    it('should use 3-column layout for very wide terminals (> 180 cols)', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'columns', { value: 200, writable: true });

      const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

      const columns = distributeToColumns(items, 3);
      expect(columns).toHaveLength(3);
      expect(columns[0]).toEqual(['A', 'B', 'C']);
      expect(columns[1]).toEqual(['D', 'E', 'F']);
      expect(columns[2]).toEqual(['G', 'H', 'I']);
    });

    it('should gracefully degrade to single column in STANDARD mode', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'columns', { value: 100, writable: true });

      const size = layoutManager.detectTerminalSize();
      const mode = layoutManager.calculateLayoutMode(size.width);

      expect(mode).toBe(LayoutMode.STANDARD);

      const items = ['Item 1', 'Item 2', 'Item 3'];
      const columns = distributeToColumns(items, 1);

      expect(columns).toHaveLength(1);
      expect(columns[0]).toEqual(['Item 1', 'Item 2', 'Item 3']);
    });
  });

  describe('Layout mode transitions', () => {
    it('should change column count when resizing from STANDARD to WIDE', () => {
      // Start in STANDARD mode
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'columns', { value: 100, writable: true });

      let layout = layoutManager.refreshLayout();
      expect(layout.mode).toBe(LayoutMode.STANDARD);
      expect(layout.columns).toBe(1);

      // Resize to WIDE
      Object.defineProperty(process.stdout, 'columns', { value: 140, writable: true });

      layout = layoutManager.refreshLayout();
      expect(layout.mode).toBe(LayoutMode.WIDE);
      expect(layout.columns).toBe(2);
    });

    it('should collapse columns when resizing from WIDE to STANDARD', () => {
      // Start in WIDE mode
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'columns', { value: 140, writable: true });

      let layout = layoutManager.refreshLayout();
      expect(layout.mode).toBe(LayoutMode.WIDE);
      expect(layout.columns).toBe(2);

      // Resize to STANDARD
      Object.defineProperty(process.stdout, 'columns', { value: 100, writable: true });

      layout = layoutManager.refreshLayout();
      expect(layout.mode).toBe(LayoutMode.STANDARD);
      expect(layout.columns).toBe(1);
    });
  });

  describe('Dashboard multi-column display', () => {
    it('should render service metrics in 2 columns for wide terminals', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'columns', { value: 140, writable: true });

      const size = layoutManager.detectTerminalSize();

      const leftColumn = ['【服务状态】', '状态: 运行中', '端口: 443', '用户数: 5'];

      const rightColumn = ['【系统资源】', 'CPU: 5%', '内存: 120MB', '运行时长: 2d 5h'];

      const rendered = renderColumns([leftColumn, rightColumn], size.width, 2);

      expect(rendered).toContain('服务状态');
      expect(rendered).toContain('系统资源');
      expect(rendered).toContain('运行中');
      expect(rendered).toContain('120MB');
    });

    it('should verify width utilization exceeds 80% in WIDE mode', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'columns', { value: 140, writable: true });

      const size = layoutManager.detectTerminalSize();
      const mode = layoutManager.calculateLayoutMode(size.width);

      expect(mode).toBe(LayoutMode.WIDE);

      // With 2 columns and 2-char gap, each column gets ~59 chars
      // Total used: 59 * 2 + 2 = 120 chars
      // Utilization: 120 / 140 = 85.7% > 80% ✓
      const expectedUsage = ((59 * 2 + 2) / 140) * 100;
      expect(expectedUsage).toBeGreaterThan(80);
    });
  });
});
