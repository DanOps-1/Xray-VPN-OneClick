import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardWidget } from '../../../src/components/dashboard-widget';
import { UI_CONSTANTS } from '../../../src/constants/theme';

// Mock dependencies
vi.mock('../../../src/services/systemd-manager', () => ({
  SystemdManager: vi.fn().mockImplementation(() => ({
    getStatus: vi.fn().mockResolvedValue({
      active: true,
      subState: 'running',
      loadState: 'loaded',
      activeState: 'active',
    }),
  })),
}));

vi.mock('../../../src/services/user-manager', () => ({
  UserManager: vi.fn().mockImplementation(() => ({
    listUsers: vi.fn().mockResolvedValue([
      { username: 'user1' },
      { username: 'user2' },
    ]),
  })),
}));

// Partial mock for os
vi.mock('os', async () => {
  const actual = await vi.importActual('os');
  return {
    ...actual,
    loadavg: () => [0.5, 0.3, 0.1],
    freemem: () => 1024 * 1024 * 1024, // 1GB
    totalmem: () => 4 * 1024 * 1024 * 1024, // 4GB
    uptime: () => 3600, // 1 hour
    type: () => 'Linux',
    release: () => '5.4.0',
  };
});

describe('DashboardWidget', () => {
  let widget: DashboardWidget;

  beforeEach(() => {
    widget = new DashboardWidget();
  });

  it('should render with correct border style', () => {
    const output = widget.render(80);
    // Standard single border characters
    expect(output).toContain('│');
    expect(output).toContain('─');
    // Should NOT contain double border characters if we switched to single
    expect(output).not.toContain('║');
    expect(output).not.toContain('═');
  });

  it('should use indicator dots for status', async () => {
    await widget.refresh();
    const output = widget.render(80);
    expect(output).toContain(UI_CONSTANTS.INDICATOR.ACTIVE);
  });
});
