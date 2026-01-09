import { IDashboardWidget } from '../types/ui-components';
import { SystemdManager } from '../services/systemd-manager';
import { UserManager } from '../services/user-manager';
import Table from 'cli-table3';
import * as os from 'os';
import { menuIcons } from '../constants/ui-symbols';
import { THEME, UI_CONSTANTS } from '../constants/theme';

export class DashboardWidget implements IDashboardWidget {
  private systemdManager: SystemdManager;
  private userManager: UserManager;
  
  private status: {
    serviceActive: boolean;
    serviceSubState: string;
    uptime: string;
    userCount: number;
    systemLoad: string;
    memoryUsage: string;
    osInfo: string;
  } = {
    serviceActive: false,
    serviceSubState: 'unknown',
    uptime: '0s',
    userCount: 0,
    systemLoad: '0.00',
    memoryUsage: '0/0 MB',
    osInfo: 'Unknown',
  };

  constructor(serviceName: string = 'xray', configPath?: string) {
    this.systemdManager = new SystemdManager(serviceName);
    this.userManager = new UserManager(configPath, serviceName);
  }

  /**
   * Refreshes the internal data snapshot
   */
  async refresh(): Promise<void> {
    try {
      const [serviceStatus, users] = await Promise.all([
        this.systemdManager.getStatus(),
        this.userManager.listUsers().catch(() => []),
      ]);

      const load = os.loadavg();
      const totalMem = Math.round(os.totalmem() / 1024 / 1024);
      const freeMem = Math.round(os.freemem() / 1024 / 1024);
      const usedMem = totalMem - freeMem;
      const uptime = os.uptime();
      
      this.status = {
        serviceActive: serviceStatus.active,
        serviceSubState: serviceStatus.subState,
        uptime: this.formatUptime(uptime),
        userCount: users.length,
        systemLoad: load[0].toFixed(2),
        memoryUsage: `${usedMem}/${totalMem} MB`,
        osInfo: `${os.type()} ${os.release()}`,
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
        'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
        'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
        'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
        'right': '│', 'right-mid': '┤', 'middle': '│'
      }
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
        [`${THEME.primary('Uptime')}:  ${THEME.neutral(this.status.uptime)}`]
      );
    } else {
      // Standard/Wide Layout
      const col1 = [
        `${THEME.primary('Service Status')}`,
        `${statusIcon} ${statusText} ${THEME.neutral(`(${this.status.uptime})`)}`
      ].join('\n');

      const col2 = [
        `${THEME.primary('System Resources')}`,
        `${THEME.neutral('Load:')} ${THEME.highlight(this.status.systemLoad)}`,
        `${THEME.neutral('Mem:')}  ${THEME.highlight(this.status.memoryUsage)}`
      ].join('\n');

      const col3 = [
        `${THEME.primary('Users')}`,
        `${THEME.secondary(menuIcons.USER)} ${THEME.highlight(String(this.status.userCount))} ${THEME.neutral('Active')}`
      ].join('\n');

      table.push([col1, col2, col3]);
    }

    return table.toString();
  }

  private calculateColWidths(width: number): number[] {
    if (width < 60) {
      return [width - 4]; // Single column accounting for borders
    }
    const contentWidth = width - 4; // Borders take ~4 chars
    const colWidth = Math.floor(contentWidth / 3);
    return [colWidth, colWidth, contentWidth - (colWidth * 2)];
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