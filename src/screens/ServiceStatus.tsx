import React from 'react';
import { Box, Text } from 'ink';
import { useServiceStatus } from '../hooks/useServiceStatus.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { KeyValue } from '../components/KeyValue.js';
import { Spinner } from '../components/Spinner.js';

export function ServiceStatus() {
  const { status, loading } = useServiceStatus(2000);

  if (loading) {
    return (
      <Box paddingX={2}>
        <Spinner message="Fetching service status..." />
      </Box>
    );
  }

  if (!status) {
    return (
      <Box paddingX={2}>
        <Text color="red">Failed to retrieve service status</Text>
      </Box>
    );
  }

  const labelW = 14;

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      <Box flexDirection="column">
        <KeyValue
          label="Status"
          labelWidth={labelW}
          value={
            <StatusBadge
              status={status.healthy ? 'running' : status.active ? 'warning' : 'stopped'}
              label={status.healthy ? 'Running' : status.active ? status.subState : 'Stopped'}
            />
          }
        />
        <KeyValue label="Active State" labelWidth={labelW} value={status.activeState} />
        <KeyValue label="Sub State" labelWidth={labelW} value={status.subState} />
        <KeyValue label="Loaded" labelWidth={labelW} value={status.loaded ? 'Yes' : 'No'} />
        {status.pid && <KeyValue label="PID" labelWidth={labelW} value={String(status.pid)} />}
        {status.uptime && <KeyValue label="Uptime" labelWidth={labelW} value={status.uptime} />}
        {status.memory && <KeyValue label="Memory" labelWidth={labelW} value={status.memory} />}
      </Box>

      <Text dimColor italic>
        Auto-refreshing every 2s
      </Text>
    </Box>
  );
}
