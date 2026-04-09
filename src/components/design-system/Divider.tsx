import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './ThemeProvider.js';
import { resolveColor } from './theme.js';

interface DividerProps {
  color?: string;
  title?: string;
  padding?: number;
}

export function Divider({ color, title, padding = 2 }: DividerProps) {
  const { theme } = useTheme();
  const w = Math.max(10, (process.stdout.columns || 80) - padding * 2);
  const dimmed = !color;
  const lineColor = resolveColor(color, theme) ?? theme.border;

  if (title) {
    const titleStr = ` ${title} `;
    const remaining = Math.max(0, w - titleStr.length);
    const left = Math.min(3, remaining);
    const right = remaining - left;
    return (
      <Box paddingX={padding}>
        <Text dimColor={dimmed} color={dimmed ? undefined : lineColor}>
          {'\u2500'.repeat(left)}
        </Text>
        <Text dimColor>{titleStr}</Text>
        <Text dimColor={dimmed} color={dimmed ? undefined : lineColor}>
          {'\u2500'.repeat(Math.max(0, right))}
        </Text>
      </Box>
    );
  }

  return (
    <Box paddingX={padding}>
      <Text dimColor={dimmed} color={dimmed ? undefined : lineColor}>
        {'\u2500'.repeat(w)}
      </Text>
    </Box>
  );
}
