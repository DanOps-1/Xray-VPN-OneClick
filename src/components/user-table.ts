import Table from 'cli-table3';
import { UserConfig } from '../types/user';
import { THEME, UI_CONSTANTS } from '../constants/theme';

/**
 * Renders a list of users as a formatted table
 * @param users - List of user configurations
 * @param width - Available terminal width
 */
export function renderUserTable(users: UserConfig[], width: number): string {
  // Determine if we can show extra columns
  const isWide = width >= 100;

  const head = isWide
    ? ['Username', 'UUID Prefix', 'Port', 'Protocol', 'Status']
    : ['Username', 'UUID Prefix', 'Status'];

  // Calculate adaptive column widths
  // Standard: [20%, 30%, 20%] approx
  // Wide: [15%, 25%, 10%, 10%, 15%] approx
  const colWidths = isWide
    ? [
        Math.floor(width * 0.15),
        Math.floor(width * 0.25),
        Math.floor(width * 0.1),
        Math.floor(width * 0.1),
        Math.floor(width * 0.15),
      ]
    : [Math.floor(width * 0.25), Math.floor(width * 0.4), Math.floor(width * 0.25)];

  const table = new Table({
    head: head.map((h) => THEME.primary(h)), // Use theme color for headers
    colWidths,
    style: {
      head: [],
      border: ['gray'], // Apply neutral color to borders
    },
    // Use theme border style
    chars:
      UI_CONSTANTS.BORDER_STYLE === 'single'
        ? {
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
          }
        : undefined,
  });

  // Limit rows and show summary if too many
  const MAX_ROWS = 10;
  const showSummary = users.length > MAX_ROWS;
  const displayUsers = showSummary ? users.slice(0, MAX_ROWS) : users;

  displayUsers.forEach((user) => {
    const uuidPrefix = user.uuid ? `${user.uuid.substring(0, 8)}...` : 'N/A';
    // Use theme indicator
    const status = THEME.success(`${UI_CONSTANTS.INDICATOR.ACTIVE} Active`);

    if (isWide) {
      table.push([
        user.username,
        uuidPrefix,
        String(user.port || 'N/A'),
        user.protocol || 'vless',
        status,
      ]);
    } else {
      table.push([user.username, uuidPrefix, status]);
    }
  });

  if (showSummary) {
    const remaining = users.length - MAX_ROWS;
    const summaryText = `... and ${remaining} more users`;

    // Create a row that spans all columns
    const summaryRow = new Array(head.length).fill('');
    summaryRow[0] = THEME.neutral(summaryText);
    table.push(summaryRow);
  }

  return table.toString();
}
