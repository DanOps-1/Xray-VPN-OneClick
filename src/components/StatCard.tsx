import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';
import { resolveColor } from './design-system/theme.js';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  subtitle?: string;
}

export function StatCard({ label, value, icon, color = 'primary', subtitle }: StatCardProps) {
  const { theme } = useTheme();
  const resolvedColor = resolveColor(color, theme)!;

  return (
    <Box flexDirection="column">
      <Text color={theme.inactive}>
        {icon ? `${icon} ` : ''}
        {label}
      </Text>
      <Text color={resolvedColor} bold>
        {String(value)}
      </Text>
      {subtitle && <Text color={theme.subtle}>{subtitle}</Text>}
    </Box>
  );
}
