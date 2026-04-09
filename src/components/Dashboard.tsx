import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';
import { formatBytes } from '../utils/format.js';

export interface DashboardData {
  serviceActive: boolean;
  uptime?: string;
  userCount: number;
  onlineCount?: number;
  totalTraffic: number;
  uploadTraffic: number;
  downloadTraffic: number;
  quotaSummary: { ok: number; warning: number; exceeded: number };
  cpuPercent?: number;
  memPercent?: number;
  diskPercent?: number;
}

interface DashboardProps {
  data: DashboardData | null;
  loading?: boolean;
}

function MiniBar({
  value,
  max = 100,
  width = 8,
  theme,
}: {
  value: number;
  max?: number;
  theme: Record<string, string>;
  width?: number;
}) {
  const ratio = Math.min(value / max, 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const color = value > 90 ? theme.error : value > 70 ? theme.warning : theme.success;
  return (
    <Text>
      <Text color={color}>{'\u2588'.repeat(filled)}</Text>
      <Text dimColor>{'\u2591'.repeat(empty)}</Text>
    </Text>
  );
}

export function Dashboard({ data, loading }: DashboardProps) {
  const { theme } = useTheme();
  const t = theme as unknown as Record<string, string>;

  if (loading || !data) {
    return (
      <Box paddingX={2}>
        <Text dimColor italic>
          Loading...
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2}>
      {/* Row 1: Traffic + Users */}
      <Box gap={2}>
        <Box gap={1}>
          <Text dimColor>Traffic</Text>
          <Text bold>{formatBytes(data.totalTraffic)}</Text>
          <Text dimColor>
            {'\u2191'}
            {formatBytes(data.uploadTraffic)} {'\u2193'}
            {formatBytes(data.downloadTraffic)}
          </Text>
        </Box>

        <Text dimColor>|</Text>

        <Box gap={1}>
          <Text dimColor>Users</Text>
          {data.onlineCount !== undefined && (
            <Text color={theme.success} bold>
              {data.onlineCount}
            </Text>
          )}
          {data.onlineCount !== undefined && <Text dimColor>/</Text>}
          <Text bold>{data.userCount}</Text>
          {data.quotaSummary.exceeded > 0 && (
            <Text color={theme.error}>({data.quotaSummary.exceeded} over)</Text>
          )}
        </Box>
      </Box>

      {/* Row 2: System resources — compact bar style */}
      {data.cpuPercent !== undefined && (
        <Box gap={2}>
          <Box gap={1}>
            <Text dimColor>cpu</Text>
            <MiniBar value={data.cpuPercent ?? 0} theme={t} />
            <Text dimColor>{data.cpuPercent}%</Text>
          </Box>
          <Box gap={1}>
            <Text dimColor>mem</Text>
            <MiniBar value={data.memPercent ?? 0} theme={t} />
            <Text dimColor>{data.memPercent}%</Text>
          </Box>
          {data.diskPercent !== undefined && (
            <Box gap={1}>
              <Text dimColor>disk</Text>
              <MiniBar value={data.diskPercent} theme={t} />
              <Text dimColor>{data.diskPercent}%</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
