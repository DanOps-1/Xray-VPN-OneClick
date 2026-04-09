import React from 'react';
import { Box, type BoxProps } from 'ink';
import { useTheme } from './ThemeProvider.js';
import { resolveColor } from './theme.js';

interface ThemedBoxProps extends Omit<BoxProps, 'borderColor'> {
  borderColor?: string;
  children?: React.ReactNode;
}

export function ThemedBox({ borderColor, children, ...props }: ThemedBoxProps) {
  const { theme } = useTheme();

  return (
    <Box borderColor={resolveColor(borderColor, theme)} {...props}>
      {children}
    </Box>
  );
}
