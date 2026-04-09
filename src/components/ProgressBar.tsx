import React from 'react';
import { Text } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';
import { resolveColor } from './design-system/theme.js';

interface ProgressBarProps {
  ratio: number;
  width?: number;
  showPercent?: boolean;
  thresholds?: { warning: number; error: number };
}

const BLOCKS = [' ', '\u2588'];

export function ProgressBar({
  ratio,
  width = 20,
  showPercent = true,
  thresholds = { warning: 0.8, error: 1.0 },
}: ProgressBarProps) {
  const { theme } = useTheme();
  const clamped = Math.max(0, Math.min(ratio, 1.5));
  const filled = Math.round(Math.min(clamped, 1) * width);
  const empty = width - filled;
  const pct = Math.round(clamped * 100);

  let fillColorKey: string;
  if (clamped >= thresholds.error) {
    fillColorKey = 'quotaExceeded';
  } else if (clamped >= thresholds.warning) {
    fillColorKey = 'quotaWarning';
  } else {
    fillColorKey = 'quotaNormal';
  }

  const fillColor = resolveColor(fillColorKey, theme)!;
  const emptyColor = resolveColor('progressEmpty', theme)!;

  return (
    <Text>
      <Text color={fillColor}>{BLOCKS[1].repeat(filled)}</Text>
      <Text color={emptyColor}>{'\u2591'.repeat(empty)}</Text>
      {showPercent && <Text color={fillColor}> {pct}%</Text>}
    </Text>
  );
}
