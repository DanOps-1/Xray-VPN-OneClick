/**
 * Integration tests for UI layout system
 *
 * Tests responsive rendering across different terminal sizes
 * Feature: 005-ui-layout-expansion - User Story 1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LayoutManager } from '../../src/services/layout-manager';
import { renderHeader, applyPadding, calculateDisplayWidth } from '../../src/utils/layout';
import { LayoutMode } from '../../src/types/layout';

describe('UI Layout Integration Tests', () => {
  let layoutManager: LayoutManager;

  beforeEach(() => {
    layoutManager = new LayoutManager();
  });

  describe('Responsive menu rendering across terminal sizes', () => {
    it('should render compact layout for 60 column terminal', () => {
      // Mock 60-column terminal
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true });
      Object.defineProperty(process.stdout, 'columns', { value: 60, writable: true });
      Object.defineProperty(process.stdout, 'rows', { value: 24, writable: true });

      const size = layoutManager.detectTerminalSize();
      expect(size.width).toBe(60);

      const mode = layoutManager.calculateLayoutMode(size.width);
      expect(mode).toBe(LayoutMode.COMPACT);

      // Render header in compact mode
      const header = renderHeader('Xray VPN', 60, 'center');
      expect(header).toBeDefined();
      expect(calculateDisplayWidth(header.split('\n')[0])).toBe(60);
    });

    it('should render standard layout for 80 column terminal', () => {
      Object.defineProperty(process.stdout, 'columns', { value: 80, writable: true });
      Object.defineProperty(process.stdout, 'rows', { value: 24, writable: true });

      const size = layoutManager.detectTerminalSize();
      const mode = layoutManager.calculateLayoutMode(size.width);
      expect(mode).toBe(LayoutMode.STANDARD);

      const header = renderHeader('Xray VPN Manager', 80, 'center');
      expect(calculateDisplayWidth(header.split('\n')[0])).toBe(80);
    });

    it('should render standard layout for 100 column terminal', () => {
      Object.defineProperty(process.stdout, 'columns', { value: 100, writable: true });

      const size = layoutManager.detectTerminalSize();
      const mode = layoutManager.calculateLayoutMode(size.width);
      expect(mode).toBe(LayoutMode.STANDARD);
    });

    it('should render standard layout for 120 column terminal', () => {
      Object.defineProperty(process.stdout, 'columns', { value: 120, writable: true });

      const size = layoutManager.detectTerminalSize();
      const mode = layoutManager.calculateLayoutMode(size.width);
      expect(mode).toBe(LayoutMode.STANDARD);
    });

    it('should render wide layout for 140 column terminal', () => {
      Object.defineProperty(process.stdout, 'columns', { value: 140, writable: true });

      const size = layoutManager.detectTerminalSize();
      const mode = layoutManager.calculateLayoutMode(size.width);
      expect(mode).toBe(LayoutMode.WIDE);
      expect(size.width).toBe(140);
    });
  });

  describe('Layout validation and error handling', () => {
    it('should detect extremely small terminals', () => {
      Object.defineProperty(process.stdout, 'columns', { value: 50, writable: true });
      Object.defineProperty(process.stdout, 'rows', { value: 15, writable: true });

      const size = layoutManager.detectTerminalSize();
      const validation = layoutManager.validateTerminalSize(size);

      expect(validation.isValid).toBe(false);
      expect(validation.message).toBeDefined();
      expect(validation.suggestion).toBeDefined();
    });

    it('should validate minimum acceptable size (60x20)', () => {
      Object.defineProperty(process.stdout, 'columns', { value: 60, writable: true });
      Object.defineProperty(process.stdout, 'rows', { value: 20, writable: true });

      const size = layoutManager.detectTerminalSize();
      const validation = layoutManager.validateTerminalSize(size);

      expect(validation.isValid).toBe(true);
    });
  });

  describe('Header rendering with padding', () => {
    it('should render header with proper padding', () => {
      const header = renderHeader('Test Header', 50, 'center', { showBorder: true });
      const lines = header.split('\n');

      expect(lines.length).toBe(3); // border + title + border
      expect(calculateDisplayWidth(lines[0])).toBe(50);
      expect(calculateDisplayWidth(lines[1])).toBe(50);
      expect(calculateDisplayWidth(lines[2])).toBe(50);
    });

    it('should apply padding correctly', () => {
      const text = 'Content';
      const padded = applyPadding(text, { top: 1, right: 2, bottom: 1, left: 2 }, 20);

      const lines = padded.split('\n');
      expect(lines.length).toBe(3); // top padding + content + bottom padding
      expect(calculateDisplayWidth(lines[0])).toBe(20); // top padding line
      expect(lines[1]).toContain('Content');
      expect(calculateDisplayWidth(lines[2])).toBe(20); // bottom padding line
    });
  });
});
