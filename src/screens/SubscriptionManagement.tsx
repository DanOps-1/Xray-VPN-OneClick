import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../components/design-system/ThemeProvider.js';
import { useServices } from '../contexts/ServiceContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useI18n } from '../contexts/I18nContext.js';
import { SubscriptionServer } from '../services/subscription-server.js';
import { PublicIpManager } from '../services/public-ip-manager.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Spinner } from '../components/Spinner.js';

interface SubInfo {
  email: string;
  token: string;
  fullUrl: string;
}

export function SubscriptionManagement() {
  const { theme } = useTheme();
  const { userManager } = useServices();
  const { notify } = useNotification();
  const { t } = useI18n();
  const [subServer] = useState(() => new SubscriptionServer(userManager));
  const [running, setRunning] = useState(false);
  const [port, setPort] = useState(2096);
  const [subs, setSubs] = useState<SubInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const config = await subServer.loadConfig();
      setPort(config.port);
      setRunning(subServer.isRunning());

      let serverIp = 'localhost';
      try {
        serverIp = await new PublicIpManager().getPublicIp();
      } catch {
        /* fallback */
      }

      const allSubs = await subServer.getAllSubscriptions();
      setSubs(
        allSubs.map((s) => ({
          email: s.email,
          token: s.token,
          fullUrl: `http://${serverIp}:${config.port}${s.url}`,
        }))
      );
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  useInput((input) => {
    if (input === 's') {
      if (running) {
        subServer.stop().then(() => {
          setRunning(false);
          notify('info', 'Server stopped');
        });
      } else {
        subServer
          .start()
          .then((p) => {
            setRunning(true);
            setPort(p);
            notify('success', `Server started on :${p}`);
          })
          .catch((e) => notify('error', (e as Error).message));
      }
    } else if (input === 'r') {
      refresh();
    }
  });

  if (loading)
    return (
      <Box paddingX={2}>
        <Spinner message={t.ui.processing} />
      </Box>
    );

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      {/* Server status */}
      <Box gap={2}>
        <Text dimColor>Server:</Text>
        <StatusBadge status={running ? 'running' : 'stopped'} />
        <Text dimColor>
          Port: <Text bold>{port}</Text>
        </Text>
      </Box>

      {/* User subscription list — each user gets full-width URL display */}
      {subs.length > 0 ? (
        <Box flexDirection="column">
          {subs.map((sub) => (
            <Box key={sub.email} flexDirection="column" marginBottom={1}>
              <Text bold>{sub.email}</Text>
              <Text color={theme.primary} wrap="wrap">
                {' '}
                {sub.fullUrl}
              </Text>
            </Box>
          ))}
        </Box>
      ) : (
        <Text dimColor>{t.ui.noUsers}</Text>
      )}

      {/* Hints */}
      <Text dimColor>
        <Text bold>s</Text> {running ? t.ui.stop : t.ui.start} <Text bold>r</Text> {t.ui.refresh}
      </Text>
    </Box>
  );
}
