/**
 * Layout Utility Functions
 *
 * Pure functions for layout calculations, text fitting, and rendering
 * Feature: 005-ui-layout-expansion
 */

import Table from 'cli-table3';

/**
 * Table column definition
 */
export interface TableColumn {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

/**
 * Render options for tables and sections
 */
export interface RenderOptions {
  showBorder?: boolean;
  borderStyle?: 'single' | 'double' | 'compact';
  padding?: { top: number; right: number; bottom: number; left: number };
}

type TableConfig = NonNullable<ConstructorParameters<typeof Table>[0]>;
type BorderChars = NonNullable<TableConfig['chars']>;

/**
 * Calculate the display width of a string, accounting for Chinese characters
 *
 * Chinese characters (and other full-width characters) occupy 2 columns,
 * while ASCII characters occupy 1 column.
 *
 * @param text - Input text
 * @returns Display width in terminal columns
 */
export function calculateDisplayWidth(text: string): number {
  let width = 0;

  for (const char of text) {
    const code = char.charCodeAt(0);

    // Chinese characters are in these Unicode ranges:
    // CJK Unified Ideographs: U+4E00 - U+9FFF
    // CJK Extension A: U+3400 - U+4DBF
    // CJK Extension B: U+20000 - U+2A6DF
    // Also check for full-width characters: U+FF00 - U+FFEF
    if (
      (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified
      (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
      (code >= 0xff00 && code <= 0xffef) || // Full-width
      (code >= 0x3000 && code <= 0x303f) // CJK Symbols and Punctuation
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }

  return width;
}

/**
 * Calculate the width of each column in a multi-column layout
 *
 * Formula: (totalWidth - (columns - 1) * gap) / columns
 *
 * @param totalWidth - Total available width
 * @param columns - Number of columns
 * @param gap - Space between columns
 * @returns Width of each column (rounded down)
 */
export function calculateColumnWidth(totalWidth: number, columns: number, gap: number): number {
  return Math.floor((totalWidth - (columns - 1) * gap) / columns);
}

/**
 * Fit text to a specific width by truncating or padding
 *
 * @param text - Input text
 * @param width - Target width in columns
 * @param align - Alignment ('left', 'center', 'right')
 * @param ellipsis - Ellipsis string for truncation (default '...')
 * @returns Text adjusted to exact width
 */
export function fitText(
  text: string,
  width: number,
  align: 'left' | 'center' | 'right' = 'left',
  ellipsis: string = '...'
): string {
  const textWidth = calculateDisplayWidth(text);

  // If text is too long, truncate with ellipsis
  if (textWidth > width) {
    const ellipsisWidth = calculateDisplayWidth(ellipsis);
    let truncated = '';
    let currentWidth = 0;

    for (const char of text) {
      const charWidth = calculateDisplayWidth(char);
      if (currentWidth + charWidth + ellipsisWidth <= width) {
        truncated += char;
        currentWidth += charWidth;
      } else {
        break;
      }
    }

    return truncated + ellipsis;
  }

  // If text is shorter, pad with spaces
  if (textWidth < width) {
    const paddingNeeded = width - textWidth;

    if (align === 'left') {
      return text + ' '.repeat(paddingNeeded);
    } else if (align === 'right') {
      return ' '.repeat(paddingNeeded) + text;
    } else {
      // center
      const leftPadding = Math.floor(paddingNeeded / 2);
      const rightPadding = paddingNeeded - leftPadding;
      return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
    }
  }

  // Exact width
  return text;
}

/**
 * Render a horizontal separator line
 *
 * @param width - Width of separator in columns
 * @param char - Character to use (default '─')
 * @param color - Optional chalk color name
 * @returns Separator string
 */
export function renderSeparator(width: number, char: string = '─', color?: string): string {
  if (width <= 0) {
    return '';
  }

  const separator = char.repeat(width);

  // Color support can be added later when integrating with chalk
  if (color) {
    // TODO: Apply chalk color
    return separator;
  }

  return separator;
}

/**
 * Render a header with optional alignment and border
 *
 * @param title - Header title text
 * @param width - Total width
 * @param align - Alignment
 * @param options - Render options
 * @returns Rendered header string
 */
export function renderHeader(
  title: string,
  width: number,
  align: 'left' | 'center' | 'right' = 'center',
  options?: { showBorder?: boolean; color?: string }
): string {
  const lines: string[] = [];

  // Add top border if requested
  if (options?.showBorder) {
    lines.push(renderSeparator(width, '─', options.color));
  }

  // Add title line
  lines.push(fitText(title, width, align));

  // Add bottom border if requested
  if (options?.showBorder) {
    lines.push(renderSeparator(width, '─', options.color));
  }

  return lines.join('\n');
}

/**
 * Apply padding to a text block
 *
 * @param text - Original text (can be multi-line)
 * @param padding - Padding configuration
 * @param width - Target width (for horizontal padding)
 * @returns Padded text
 */
export function applyPadding(
  text: string,
  padding: { top: number; right: number; bottom: number; left: number },
  width: number
): string {
  const lines: string[] = [];

  // Top padding
  for (let i = 0; i < padding.top; i++) {
    lines.push(' '.repeat(width));
  }

  // Process content lines
  const contentLines = text.split('\n');
  const contentWidth = width - padding.left - padding.right;

  for (const line of contentLines) {
    const paddedLine =
      ' '.repeat(padding.left) + fitText(line, contentWidth, 'left') + ' '.repeat(padding.right);
    lines.push(paddedLine);
  }

  // Bottom padding
  for (let i = 0; i < padding.bottom; i++) {
    lines.push(' '.repeat(width));
  }

  return lines.join('\n');
}

/**
 * Render a table using cli-table3
 *
 * @param columns - Column definitions
 * @param rows - Data rows
 * @param options - Render options
 * @returns Rendered table string
 */
export function renderTable(
  columns: TableColumn[],
  rows: Record<string, unknown>[],
  options?: RenderOptions
): string {
  // Map border style to cli-table3 style
  const borderChars: Record<NonNullable<RenderOptions['borderStyle']>, BorderChars> = {
    single: {
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
    double: {
      top: '═',
      'top-mid': '╦',
      'top-left': '╔',
      'top-right': '╗',
      bottom: '═',
      'bottom-mid': '╩',
      'bottom-left': '╚',
      'bottom-right': '╝',
      left: '║',
      'left-mid': '╠',
      mid: '═',
      'mid-mid': '╬',
      right: '║',
      'right-mid': '╣',
      middle: '║',
    },
    compact: {
      top: '-',
      'top-mid': '+',
      'top-left': '+',
      'top-right': '+',
      bottom: '-',
      'bottom-mid': '+',
      'bottom-left': '+',
      'bottom-right': '+',
      left: '|',
      'left-mid': '+',
      mid: '-',
      'mid-mid': '+',
      right: '|',
      'right-mid': '+',
      middle: '|',
    },
  };

  const borderStyle: NonNullable<RenderOptions['borderStyle']> = options?.borderStyle ?? 'single';

  // Create table configuration
  const tableConfig: TableConfig = {
    head: columns.map((col) => col.header),
    chars: borderChars[borderStyle],
  };

  // Add column-specific configurations
  if (columns.some((col) => col.width || col.align)) {
    tableConfig.colWidths = columns.map((col) => col.width ?? null);
    tableConfig.colAligns = columns.map((col) => col.align ?? 'left');
  }

  const table = new Table(tableConfig);

  // Add rows
  for (const row of rows) {
    const tableRow = columns.map((col) => {
      const value = row[col.key];
      return value !== undefined && value !== null ? String(value) : '';
    });
    table.push(tableRow);
  }

  return table.toString();
}

/**
 * Render a section with title and content
 *
 * @param title - Section title
 * @param content - Section content (can be multi-line)
 * @param options - Render options
 * @returns Rendered section string
 */
export function renderSection(title: string, content: string, options?: RenderOptions): string {
  const lines: string[] = [];
  const showBorder = options?.showBorder ?? false;
  const padding = options?.padding || { top: 0, right: 0, bottom: 0, left: 0 };

  // Calculate content width (approximate - will depend on actual rendering)
  const contentLines = content.split('\n');
  const maxContentWidth = Math.max(
    calculateDisplayWidth(title),
    ...contentLines.map((line) => calculateDisplayWidth(line))
  );

  const totalWidth = maxContentWidth + padding.left + padding.right + 4; // +4 for borders if any

  // Top border
  if (showBorder) {
    lines.push(renderSeparator(totalWidth, '─'));
  }

  // Top padding
  for (let i = 0; i < padding.top; i++) {
    lines.push(' '.repeat(totalWidth));
  }

  // Title line
  const titleLine = ' '.repeat(padding.left) + title + ' '.repeat(padding.right);
  lines.push(titleLine);

  // Add separator between title and content if border is enabled
  if (showBorder) {
    lines.push(renderSeparator(totalWidth, '─'));
  } else {
    lines.push(''); // Empty line for visual separation
  }

  // Content lines
  for (const contentLine of contentLines) {
    const paddedContentLine = ' '.repeat(padding.left) + contentLine + ' '.repeat(padding.right);
    lines.push(paddedContentLine);
  }

  // Bottom padding
  for (let i = 0; i < padding.bottom; i++) {
    lines.push(' '.repeat(totalWidth));
  }

  // Bottom border
  if (showBorder) {
    lines.push(renderSeparator(totalWidth, '─'));
  }

  return lines.join('\n');
}

/**
 * Distribute items evenly across multiple columns
 *
 * @param items - Array of items to distribute
 * @param columnCount - Number of columns to create
 * @returns Array of columns, each containing a subset of items
 *
 * @example
 * distributeToColumns(['A', 'B', 'C', 'D', 'E', 'F'], 2)
 * // Returns: [['A', 'B', 'C'], ['D', 'E', 'F']]
 *
 * distributeToColumns(['A', 'B', 'C', 'D', 'E'], 2)
 * // Returns: [['A', 'B', 'C'], ['D', 'E']]
 */
export function distributeToColumns<T>(items: T[], columnCount: number): T[][] {
  if (columnCount <= 0) {
    throw new Error('Column count must be positive');
  }

  if (columnCount === 1) {
    return [items];
  }

  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  const itemsPerColumn = Math.ceil(items.length / columnCount);

  for (let i = 0; i < items.length; i++) {
    const columnIndex = Math.floor(i / itemsPerColumn);
    if (columnIndex < columnCount) {
      columns[columnIndex].push(items[i]);
    }
  }

  return columns;
}

/**
 * Render multiple columns of text side by side
 *
 * @param columns - Array of columns, each containing lines of text
 * @param totalWidth - Total width available for all columns
 * @param gap - Space between columns (default: 2)
 * @returns Rendered multi-column text
 *
 * @example
 * renderColumns([['Line 1', 'Line 2'], ['Col 2 Line 1', 'Col 2 Line 2']], 80, 2)
 * // Returns text with two columns side by side
 */
export function renderColumns(columns: string[][], totalWidth: number, gap: number = 2): string {
  if (columns.length === 0) {
    return '';
  }

  if (columns.length === 1) {
    return columns[0].join('\n');
  }

  const columnWidth = calculateColumnWidth(totalWidth, columns.length, gap);
  const maxHeight = Math.max(...columns.map((col) => col.length));
  const lines: string[] = [];

  for (let row = 0; row < maxHeight; row++) {
    const rowParts: string[] = [];

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const cellContent = row < columns[colIndex].length ? columns[colIndex][row] : '';
      rowParts.push(fitText(cellContent, columnWidth, 'left'));
    }

    lines.push(rowParts.join(' '.repeat(gap)));
  }

  return lines.join('\n');
}
