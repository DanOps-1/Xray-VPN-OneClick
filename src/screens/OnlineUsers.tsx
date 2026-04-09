import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '../components/design-system/ThemeProvider.js';
import { useI18n } from '../contexts/I18nContext.js';
import { useOnlineUsers } from '../hooks/useOnlineUsers.js';
import { Spinner } from '../components/Spinner.js';
import { formatBytes } from '../utils/format.js';

export function OnlineUsers() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { summary, loading } = useOnlineUsers(5000);

  if (loading)
    return (
      <Box paddingX={2}>
        <Spinner message={t.ui.processing} />
      </Box>
    );

  if (!summary) {
    return (
      <Box paddingX={2}>
        <Text dimColor>{t.ui.noConnections}</Text>
      </Box>
    );
  }

  const activeList = summary.activeUsers.filter((u) => u.activeNow);
  const allUsers = summary.activeUsers;

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      {/* Summary line */}
      <Box gap={2}>
        <Text>
          <Text color={theme.success} bold>
            {summary.activeCount}
          </Text>
          <Text dimColor> active</Text>
        </Text>
        <Text dimColor>|</Text>
        <Text>
          <Text bold>{allUsers.length}</Text>
          <Text dimColor> {t.ui.users} total</Text>
        </Text>
        {summary.uniqueIps > 0 && (
          <>
            <Text dimColor>|</Text>
            <Text>
              <Text bold>{summary.uniqueIps}</Text>
              <Text dimColor> IPs</Text>
            </Text>
          </>
        )}
        {!summary.statsAvailable && <Text color={theme.warning}>Stats API unavailable</Text>}
      </Box>

      {/* User traffic table */}
      {allUsers.length > 0 ? (
        <Box flexDirection="column">
          {/* Header */}
          <Box>
            <Box width={24}>
              <Text dimColor bold>
                User
              </Text>
            </Box>
            <Box width={14}>
              <Text dimColor bold>
                {'\u2191'} Upload
              </Text>
            </Box>
            <Box width={14}>
              <Text dimColor bold>
                {'\u2193'} Download
              </Text>
            </Box>
            <Box width={10}>
              <Text dimColor bold>
                Status
              </Text>
            </Box>
          </Box>

          {/* Rows */}
          {allUsers.map((user) => (
            <Box key={user.email}>
              <Box width={24}>
                <Text color={user.activeNow ? theme.text : theme.inactive}>{user.email}</Text>
              </Box>
              <Box width={14}>
                <Text dimColor={!user.activeNow}>{formatBytes(user.upload)}</Text>
              </Box>
              <Box width={14}>
                <Text dimColor={!user.activeNow}>{formatBytes(user.download)}</Text>
              </Box>
              <Box width={10}>
                {user.activeNow ? (
                  <Text color={theme.success} bold>
                    {'\u25cf'} active
                  </Text>
                ) : (
                  <Text dimColor>{'\u25cb'} idle</Text>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Text dimColor>{t.ui.noConnections}</Text>
      )}

      {/* TCP connections section */}
      {summary.tcpConnections.length > 0 && (
        <Box flexDirection="column">
          <Text dimColor>TCP connections:</Text>
          {summary.tcpConnections.slice(0, 10).map((c, i) => (
            <Text key={i} dimColor>
              {' '}
              {c.remoteIp}:{c.remotePort} {'\u2192'} :{c.localPort}
            </Text>
          ))}
          {summary.tcpConnections.length > 10 && (
            <Text dimColor> ...and {summary.tcpConnections.length - 10} more</Text>
          )}
        </Box>
      )}

      <Text dimColor italic>
        {t.ui.autoRefresh}: 5s
      </Text>
    </Box>
  );
}
