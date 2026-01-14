/**
 * Progress Bar Component
 *
 * Renders ASCII progress bars for traffic usage display
 *
 * @module components/progress-bar
 */

import { THEME } from '../constants/theme';

/**
 * Progress bar options
 */
export interface ProgressBarOptions {
  /** Total width of the progress bar (default: 20) */
  width?: number;

  /** Character for filled portion (default: '█') */
  filledChar?: string;

  /** Character for empty portion (default: '░') */
  emptyChar?: string;

  /** Show percentage text (default: true) */
  showPercent?: boolean;

  /** Color thresholds for warning/error states */
  thresholds?: {
    warning: number; // Default: 80
    error: number; // Default: 100
  };
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: Required<ProgressBarOptions> = {
  width: 20,
  filledChar: '█',
  emptyChar: '░',
  showPercent: true,
  thresholds: {
    warning: 80,
    error: 100,
  },
};

/**
 * Render a progress bar
 *
 * @param percent - Current percentage (0-100+)
 * @param options - Rendering options
 * @returns Formatted progress bar string
 */
export function renderProgressBar(percent: number, options: ProgressBarOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, filledChar, emptyChar, showPercent, thresholds } = opts;

  // Clamp percentage for display (but keep original for color)
  const displayPercent = Math.min(percent, 100);
  const filledWidth = Math.round((displayPercent / 100) * width);
  const emptyWidth = width - filledWidth;

  // Build the bar
  const filled = filledChar.repeat(filledWidth);
  const empty = emptyChar.repeat(emptyWidth);

  // Determine color based on thresholds
  let colorFn: (_s: string) => string;
  if (percent >= thresholds.error) {
    colorFn = THEME.error;
  } else if (percent >= thresholds.warning) {
    colorFn = THEME.warning;
  } else {
    colorFn = THEME.success;
  }

  // Build result
  const bar = colorFn(filled) + THEME.neutral(empty);
  const percentText = showPercent ? ` ${Math.round(percent)}%` : '';

  return `[${bar}]${colorFn(percentText)}`;
}

/**
 * Render a compact progress bar (for tight spaces)
 *
 * @param percent - Current percentage (0-100+)
 * @param width - Bar width (default: 10)
 * @returns Formatted compact progress bar
 */
export function renderCompactBar(percent: number, width: number = 10): string {
  return renderProgressBar(percent, {
    width,
    showPercent: false,
    filledChar: '▓',
    emptyChar: '░',
  });
}

/**
 * Render a usage summary with progress bar
 *
 * @param usedBytes - Used bytes
 * @param totalBytes - Total quota bytes (-1 for unlimited)
 * @param formatFn - Function to format bytes to display string
 * @returns Formatted usage summary with progress bar
 */
export function renderUsageSummary(
  usedBytes: number,
  totalBytes: number,
  formatFn: (_bytes: number) => string
): string {
  if (totalBytes < 0) {
    // Unlimited quota
    return `${formatFn(usedBytes)} / ${THEME.neutral('无限制')}`;
  }

  const percent = (usedBytes / totalBytes) * 100;
  const bar = renderProgressBar(percent, { width: 15 });
  const usedStr = formatFn(usedBytes);
  const totalStr = formatFn(totalBytes);

  return `${bar} ${usedStr} / ${totalStr}`;
}

/**
 * Render a mini indicator (single character)
 *
 * @param percent - Current percentage
 * @returns Single colored character indicator
 */
export function renderMiniIndicator(percent: number): string {
  if (percent >= 100) {
    return THEME.error('●');
  } else if (percent >= 80) {
    return THEME.warning('●');
  } else {
    return THEME.success('●');
  }
}

/**
 * Render usage as a fraction with color
 *
 * @param usedBytes - Used bytes
 * @param totalBytes - Total quota bytes
 * @param formatFn - Function to format bytes
 * @returns Colored fraction string
 */
export function renderUsageFraction(
  usedBytes: number,
  totalBytes: number,
  formatFn: (_bytes: number) => string
): string {
  if (totalBytes < 0) {
    return `${formatFn(usedBytes)} / ${THEME.neutral('∞')}`;
  }

  const percent = (usedBytes / totalBytes) * 100;
  let colorFn: (_text: string) => string;

  if (percent >= 100) {
    colorFn = THEME.error;
  } else if (percent >= 80) {
    colorFn = THEME.warning;
  } else {
    colorFn = THEME.success;
  }

  return `${colorFn(formatFn(usedBytes))} / ${THEME.neutral(formatFn(totalBytes))}`;
}
