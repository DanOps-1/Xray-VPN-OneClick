import React from 'react';
import { Text } from 'ink';
import { useTheme } from './ThemeProvider.js';
import { resolveColor } from './theme.js';

interface ThemedTextProps {
  color?: string;
  backgroundColor?: string;
  dimColor?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end';
  children?: React.ReactNode;
}

export function ThemedText({
  color,
  backgroundColor,
  dimColor,
  bold,
  italic,
  underline,
  strikethrough,
  wrap,
  children,
}: ThemedTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      color={resolveColor(color, theme)}
      backgroundColor={resolveColor(backgroundColor, theme)}
      dimColor={dimColor}
      bold={bold}
      italic={italic}
      underline={underline}
      strikethrough={strikethrough}
      wrap={wrap}
    >
      {children}
    </Text>
  );
}
