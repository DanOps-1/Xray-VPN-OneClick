import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './ThemeProvider.js';
import { useI18n } from '../../contexts/I18nContext.js';

interface HeaderProps {
  version: string;
  serviceStatus?: 'running' | 'stopped' | 'error' | 'loading';
  uptime?: string;
}

export function Header({ version, serviceStatus = 'loading', uptime }: HeaderProps) {
  const { theme } = useTheme();
  const { t } = useI18n();

  const statusColor =
    serviceStatus === 'running'
      ? theme.serviceRunning
      : serviceStatus === 'stopped'
        ? theme.serviceStopped
        : serviceStatus === 'error'
          ? theme.error
          : theme.inactive;

  const statusLabel = t.status[serviceStatus] ?? serviceStatus;

  return (
    <Box paddingX={2} paddingY={1} justifyContent="space-between">
      <Box gap={1}>
        <Text color={theme.primary} bold>
          Xray Manager
        </Text>
        <Text dimColor>v{version}</Text>
      </Box>
      <Box gap={1}>
        <Text color={statusColor} bold>
          {'\u25cf'} {statusLabel}
        </Text>
        {uptime && <Text dimColor>{uptime}</Text>}
      </Box>
    </Box>
  );
}
