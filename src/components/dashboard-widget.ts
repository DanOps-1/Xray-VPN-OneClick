import { IDashboardWidget } from '../types/ui-components';
import { SystemdManager } from '../services/systemd-manager';
import { UserManager } from '../services/user-manager';
import { QuotaManager } from '../services/quota-manager';
import { TrafficManager } from '../services/traffic-manager';
import { formatTraffic } from '../utils/traffic-formatter';
import Table from 'cli-table3';
import * as os from 'os';
import { menuIcons } from '../constants/ui-symbols';
import { THEME, UI_CONSTANTS } from '../constants/theme';

export class DashboardWidget implements IDashboardWidget {
  private systemdManager: SystemdManager;
  private userManager: UserManager;
  private quotaManager: QuotaManager;
  private trafficManager: TrafficManager;

  private status: {
    serviceActive: boolean;
    serviceSubState: string;
    uptime: string;
    userCount: number;
    systemLoad: string;
    memoryUsage: string;
    osInfo: string;
    totalTraffic: string;
    statsAvailable: boolean;
    activeUsers: number;
    warningUsers: number;
    exceededUsers: number;
  } = {
    serviceActive: false,
    serviceSubState: 'unknown',
    uptime: '0s',
    userCount: 0,
    systemLoad: '0.00',
    memoryUsage: '0/0 MB',
    osInfo: 'Unknown',
    totalTraffic: '0 B',
    statsAvailable: false,
    activeUsers: 0,
    warningUsers: 0,
    exceededUsers: 0,
  };

  constructor(serviceName: string = 'xray', configPath?: string) {
    this.systemdManager = new SystemdManager(serviceName);
    this.userManager = new UserManager(configPath, serviceName);
    this.quotaManager = new QuotaManager();
    this.trafficManager = new TrafficManager();
  }

  /**
   * Refreshes the internal data snapshot
   */
  async refresh(): Promise<void> {
    try {
      const [serviceStatus, users, quotas, statsAvailable] = await Promise.all([
        this.systemdManager.getStatus(),
        this.userManager.listUsers().catch(() => []),
        this.quotaManager.getAllQuotas().catch(() => ({})),
        this.trafficManager.isUsageAvailable().catch(() => false),
      ]);

      const usages = statsAvailable ? await this.trafficManager.getAllUsage().catch(() => []) : [];

      const load = os.loadavg();
      const totalMem = Math.round(os.totalmem() / 1024 / 1024);
      const freeMem = Math.round(os.freemem() / 1024 / 1024);
      const usedMem = totalMem - freeMem;
      const uptime = os.uptime();

      // Calculate traffic statistics
      let totalTrafficBytes = 0;
      let activeUsers = 0;
      let warningUsers = 0;
      let exceededUsers = 0;

      for (const usage of usages) {
        totalTrafficBytes += usage.total;
      }

      // Count users by quota status
      if (statsAvailable) {
        for (const [email, quota] of Object.entries(quotas)) {
          const usage = usages.find((u) => u.email === email);
          const usedBytes = usage?.total || quota.usedBytes || 0;

          if (quota.quotaBytes > 0) {
            const percent = (usedBytes / quota.quotaBytes) * 100;
            if (percent >= 100) {
              exceededUsers++;
            } else if (percent >= 80) {
              warningUsers++;
            } else {
              activeUsers++;
            }
          } else {
            activeUsers++; // Unlimited quota counts as active
          }
        }
      }

      this.status = {
        serviceActive: serviceStatus.active,
        serviceSubState: serviceStatus.subState,
        uptime: this.formatUptime(uptime),
        userCount: users.length,
        systemLoad: load[0].toFixed(2),
        memoryUsage: `${usedMem}/${totalMem} MB`,
        osInfo: `${os.type()} ${os.release()}`,
        totalTraffic: statsAvailable ? formatTraffic(totalTrafficBytes).display : '统计未启用',
        statsAvailable,
        activeUsers,
        warningUsers,
        exceededUsers,
      };
    } catch (error) {
      // Graceful degradation
      console.error('Failed to refresh dashboard:', error);
    }
  }

  /**
   * Renders the dashboard
   */
  render(width: number): string {
    // Determine layout based on width
    const table = new Table({
      head: [],
      colWidths: this.calculateColWidths(width),
      style: {
        head: [],
        border: ['gray'], // Apply neutral color to borders
      },
      // Use standard single line characters for cleaner look
      chars: {
        top: '─',
        'top-mid': '┬',
        'top-left': '┌',
        'top-right': '┐',
        bottom: '─',
        'bottom-mid': '┴',
        'bottom-left': '└',
        'bottom-right': '┘',
        left: '│',
        'left-mid': '├',
        mid: '─',
        'mid-mid': '┼',
        right: '│',
        'right-mid': '┤',
        middle: '│',
      },
    });

    // Use indicators instead of coloring full text
    const statusIcon = this.status.serviceActive
      ? THEME.success(UI_CONSTANTS.INDICATOR.ACTIVE)
      : THEME.error(UI_CONSTANTS.INDICATOR.ACTIVE); // Use dot for inactive too, just red

    const statusText = this.status.serviceActive
      ? THEME.neutral('Active')
      : THEME.neutral(this.status.serviceSubState);

    if (width < 60) {
      // Compact Layout
      table.push(
        [`${THEME.primary('Service')}: ${statusIcon} ${statusText}`],
        [`${THEME.primary('Users')}:   ${THEME.highlight(String(this.status.userCount))}`],
        [`${THEME.primary('Traffic')}: ${THEME.highlight(this.status.totalTraffic)}`],
        [`${THEME.primary('Uptime')}:  ${THEME.neutral(this.status.uptime)}`]
      );
    } else {
      // Standard/Wide Layout
      const col1 = [
        `${THEME.primary('Service Status')}`,
        `${statusIcon} ${statusText} ${THEME.neutral(`(${this.status.uptime})`)}`,
      ].join('\n');

      const col2 = [
        `${THEME.primary('Traffic Overview')}`,
        `${THEME.secondary(menuIcons.STATS)} ${THEME.highlight(this.status.totalTraffic)}`,
        this.getUserStatusLine(),
      ].join('\n');

      const col3 = [
        `${THEME.primary('Users')}`,
        `${THEME.secondary(menuIcons.USER)} ${THEME.highlight(String(this.status.userCount))} ${THEME.neutral('Total')}`,
      ].join('\n');

      table.push([col1, col2, col3]);
    }

    return table.toString();
  }

  private getUserStatusLine(): string {
    if (!this.status.statsAvailable) {
      return THEME.neutral('统计未启用');
    }

    const parts: string[] = [];

    if (this.status.activeUsers > 0) {
      parts.push(THEME.success(`${this.status.activeUsers} OK`));
    }
    if (this.status.warningUsers > 0) {
      parts.push(THEME.warning(`${this.status.warningUsers} Warn`));
    }
    if (this.status.exceededUsers > 0) {
      parts.push(THEME.error(`${this.status.exceededUsers} Over`));
    }

    return parts.length > 0 ? parts.join(' ') : THEME.neutral('No quotas set');
  }

  private calculateColWidths(width: number): number[] {
    if (width < 60) {
      return [width - 4]; // Single column accounting for borders
    }
    const contentWidth = width - 4; // Borders take ~4 chars
    const colWidth = Math.floor(contentWidth / 3);
    return [colWidth, colWidth, contentWidth - colWidth * 2];
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}
