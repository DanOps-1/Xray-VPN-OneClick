import { IScreenManager, IDashboardWidget } from '../types/ui-components';
import { detectTerminalCapabilities } from '../utils/terminal';
import { THEME, UI_CONSTANTS } from '../constants/theme';

export class ScreenManager implements IScreenManager {
  /**
   * Clears the terminal screen and scrollback
   */
  clear(): void {
    // Standard ANSI sequence to clear screen and scrollback
    // \x1b[2J: Clear entire screen
    // \x1b[3J: Clear scrollback buffer (supported by xterm, GNOME Terminal, etc.)
    // \x1b[H: Move cursor to home position (0,0)
    process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
  }

  /**
   * Renders the complete frame: Dashboard + Breadcrumb
   */
  renderHeader(dashboard: IDashboardWidget, breadcrumb: string): void {
    const caps = detectTerminalCapabilities();
    const width = caps.width;

    // Render dashboard
    const dashboardOutput = dashboard.render(width);
    console.log(dashboardOutput);

    // Render breadcrumb if present
    if (breadcrumb) {
      this.renderBreadcrumb(breadcrumb);
    }
  }

  private renderBreadcrumb(breadcrumb: string): void {
    // Minimalist breadcrumb: Just text with padding, no heavy lines
    // Add vertical padding
    console.log('');

    // Add horizontal padding (space) and color
    const padding = ' '.repeat(UI_CONSTANTS.PADDING);
    console.log(`${padding}${THEME.primary(breadcrumb)}`);

    console.log('');
  }
}
