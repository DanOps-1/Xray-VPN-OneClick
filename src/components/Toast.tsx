import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';

type ToastType = 'success' | 'error' | 'warning' | 'info';

const TOAST_ICONS: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2717',
  warning: '!',
  info: '\u2139',
};

const TOAST_COLORS: Record<ToastType, string> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({ type, message, duration = 3000, onDismiss }: ToastProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (onDismiss && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const color = (theme as unknown as Record<string, string>)[TOAST_COLORS[type]] ?? theme.text;

  return (
    <Box>
      <Text color={color} bold>
        {TOAST_ICONS[type]}
      </Text>
      <Text color={color}> {message}</Text>
    </Box>
  );
}
