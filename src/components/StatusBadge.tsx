import React from 'react';
import { Text } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';
import { resolveColor } from './design-system/theme.js';

type BadgeStatus =
  | 'running'
  | 'stopped'
  | 'error'
  | 'warning'
  | 'loading'
  | 'disabled'
  | 'ok'
  | 'exceeded';

const STATUS_CONFIG: Record<BadgeStatus, { icon: string; themeKey: string; label: string }> = {
  running: { icon: '\u25cf', themeKey: 'serviceRunning', label: 'Running' },
  stopped: { icon: '\u25cf', themeKey: 'serviceStopped', label: 'Stopped' },
  error: { icon: '\u25cf', themeKey: 'error', label: 'Error' },
  warning: { icon: '\u25cf', themeKey: 'warning', label: 'Warning' },
  loading: { icon: '\u25cb', themeKey: 'inactive', label: 'Loading' },
  disabled: { icon: '\u25cf', themeKey: 'inactive', label: 'Disabled' },
  ok: { icon: '\u25cf', themeKey: 'success', label: 'OK' },
  exceeded: { icon: '\u25cf', themeKey: 'quotaExceeded', label: 'Exceeded' },
};

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const { theme } = useTheme();
  const config = STATUS_CONFIG[status];
  const color = resolveColor(config.themeKey, theme);

  return (
    <Text>
      <Text color={color}>{config.icon}</Text>
      <Text> </Text>
      <Text color={color}>{label ?? config.label}</Text>
    </Text>
  );
}
