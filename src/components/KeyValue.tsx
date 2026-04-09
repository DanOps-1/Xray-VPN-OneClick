import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';

interface KeyValueProps {
  label: string;
  value: React.ReactNode;
  labelWidth?: number;
}

export function KeyValue({ label, value, labelWidth }: KeyValueProps) {
  const { theme } = useTheme();

  return (
    <Box>
      <Box width={labelWidth}>
        <Text color={theme.inactive}>{label}:</Text>
      </Box>
      <Text> </Text>
      {typeof value === 'string' ? <Text color={theme.text}>{value}</Text> : value}
    </Box>
  );
}
