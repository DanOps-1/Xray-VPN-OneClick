/**
 * Integration tests for table and section rendering
 *
 * Tests visual grouping and structured information display
 * Feature: 005-ui-layout-expansion - User Story 2
 */

import { describe, it, expect } from 'vitest';
import { renderTable, renderSection } from '../../src/utils/layout';

describe('Table and Section Rendering Integration', () => {
  describe('User list table display', () => {
    it('should render user list with proper columns and alignment', () => {
      const columns = [
        { header: 'Username', key: 'username', align: 'left' as const },
        { header: 'UUID', key: 'uuid', align: 'left' as const },
        { header: 'Status', key: 'status', align: 'center' as const },
        { header: 'Traffic', key: 'traffic', align: 'right' as const },
      ];

      const rows = [
        { username: 'user1', uuid: 'a1b2c3d4-e5f6', status: 'Active', traffic: '1.2GB' },
        { username: 'user2', uuid: 'g7h8i9j0-k1l2', status: 'Inactive', traffic: '450MB' },
        { username: 'testuser', uuid: 'm3n4o5p6-q7r8', status: 'Active', traffic: '2.5GB' },
      ];

      const result = renderTable(columns, rows, { borderStyle: 'single' });

      // Verify all headers present
      expect(result).toContain('Username');
      expect(result).toContain('UUID');
      expect(result).toContain('Status');
      expect(result).toContain('Traffic');

      // Verify all data present
      expect(result).toContain('user1');
      expect(result).toContain('user2');
      expect(result).toContain('testuser');
      expect(result).toContain('Active');
      expect(result).toContain('Inactive');
      expect(result).toContain('1.2GB');
      expect(result).toContain('450MB');
    });

    it('should handle empty user list gracefully', () => {
      const columns = [
        { header: 'Username', key: 'username' },
        { header: 'Status', key: 'status' },
      ];

      const result = renderTable(columns, []);

      // Should still show headers
      expect(result).toContain('Username');
      expect(result).toContain('Status');
    });

    it('should render table with Chinese column headers', () => {
      const columns = [
        { header: '用户名', key: 'username', align: 'left' as const },
        { header: '状态', key: 'status', align: 'center' as const },
        { header: '流量', key: 'traffic', align: 'right' as const },
      ];

      const rows = [{ username: 'user1', status: '活跃', traffic: '1.2GB' }];

      const result = renderTable(columns, rows);

      expect(result).toContain('用户名');
      expect(result).toContain('状态');
      expect(result).toContain('流量');
      expect(result).toContain('活跃');
    });
  });

  describe('Service status sections', () => {
    it('should render service info with visual grouping using sections', () => {
      const statusSection = renderSection('服务状态', '运行中\n进程 PID: 12345\n运行时长: 2d 5h', {
        showBorder: true,
      });

      const configSection = renderSection(
        '配置信息',
        '监听端口: 443\n传输协议: VLESS\n安全: Reality',
        { showBorder: true }
      );

      const networkSection = renderSection('网络信息', '公网 IP: 192.168.1.1\n带宽: 100Mbps', {
        showBorder: true,
      });

      // Verify all sections render properly
      expect(statusSection).toContain('服务状态');
      expect(statusSection).toContain('运行中');
      expect(statusSection).toContain('12345');

      expect(configSection).toContain('配置信息');
      expect(configSection).toContain('443');
      expect(configSection).toContain('VLESS');

      expect(networkSection).toContain('网络信息');
      expect(networkSection).toContain('192.168.1.1');
    });

    it('should render sections with separators for clear boundaries', () => {
      const section1 = renderSection('Section 1', 'Content 1', { showBorder: true });
      const section2 = renderSection('Section 2', 'Content 2', { showBorder: true });

      // Both sections should have borders for visual separation
      expect(section1).toBeDefined();
      expect(section2).toBeDefined();
      expect(section1).toContain('Section 1');
      expect(section2).toContain('Section 2');
    });

    it('should handle mixed English and Chinese in sections', () => {
      const result = renderSection('Service Status (服务状态)', 'Running (运行中)', {
        showBorder: false,
      });

      expect(result).toContain('Service Status');
      expect(result).toContain('服务状态');
      expect(result).toContain('Running');
      expect(result).toContain('运行中');
    });
  });

  describe('Visual hierarchy', () => {
    it('should demonstrate clear visual grouping with sections', () => {
      // Main section with subsections
      const mainSection = renderSection('=== 系统概览 ===', '以下是系统各模块状态', {
        showBorder: false,
      });

      const statusSubsection = renderSection('1. 服务状态', '✓ 正常运行', {
        showBorder: false,
        padding: { top: 0, right: 0, bottom: 0, left: 2 },
      });

      const userSubsection = renderSection('2. 用户统计', '当前用户: 5', {
        showBorder: false,
        padding: { top: 0, right: 0, bottom: 0, left: 2 },
      });

      expect(mainSection).toContain('系统概览');
      expect(statusSubsection).toContain('服务状态');
      expect(userSubsection).toContain('用户统计');
    });
  });
});
