import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';

interface ConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  defaultValue?: boolean;
  destructive?: boolean;
  isFocused?: boolean;
}

export function Confirm({
  message,
  onConfirm,
  onCancel,
  defaultValue = false,
  destructive = false,
  isFocused = true,
}: ConfirmProps) {
  const { theme } = useTheme();
  const color = destructive ? theme.error : theme.warning;
  const hint = defaultValue ? '[Y/n]' : '[y/N]';

  useInput(
    (input, key) => {
      if (input === 'y' || input === 'Y') {
        onConfirm();
      } else if (input === 'n' || input === 'N' || key.escape) {
        onCancel();
      } else if (key.return) {
        if (defaultValue) onConfirm();
        else onCancel();
      }
    },
    { isActive: isFocused }
  );

  return (
    <Box>
      <Text color={color} bold>
        {'? '}
      </Text>
      <Text color={theme.text}>{message} </Text>
      <Text color={theme.inactive}>{hint}</Text>
    </Box>
  );
}
