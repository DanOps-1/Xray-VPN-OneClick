import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '../components/design-system/ThemeProvider.js';
import { useServices } from '../contexts/ServiceContext.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useUsers } from '../hooks/useUsers.js';
import { Select, type SelectItem } from '../components/Select.js';
import { Spinner } from '../components/Spinner.js';
import { type Route } from '../app/routes.js';

export function UserShare() {
  const { theme } = useTheme();
  const { userManager } = useServices();
  const { goBack, currentRoute } = useNavigation();
  const { notify } = useNotification();
  const { users, loading: usersLoading } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    (currentRoute as Extract<Route, { screen: 'user-share' }>).userId ?? null
  );
  const [shareInfo, setShareInfo] = useState<{ link: string; email: string } | null>(null);
  const [loadingShare, setLoadingShare] = useState(false);

  useEffect(() => {
    if (selectedUserId) {
      setLoadingShare(true);
      userManager
        .getShareInfo(selectedUserId)
        .then((info) => {
          setShareInfo({
            link: info.shareLink ?? 'No share link available',
            email: info.user?.email ?? selectedUserId.slice(0, 8),
          });
        })
        .catch((e) => {
          notify('error', `Failed: ${(e as Error).message}`);
          setShareInfo(null);
        })
        .finally(() => setLoadingShare(false));
    }
  }, [selectedUserId, userManager, notify]);

  if (usersLoading)
    return (
      <Box paddingX={2}>
        <Spinner message="Loading users..." />
      </Box>
    );

  if (!selectedUserId) {
    const items: SelectItem<string>[] = users.map((u) => ({
      label: u.email ?? u.id.slice(0, 8),
      value: u.id,
    }));
    return (
      <Select items={items} onSelect={setSelectedUserId} onCancel={goBack} title="Select user:" />
    );
  }

  if (loadingShare)
    return (
      <Box paddingX={2}>
        <Spinner message="Generating link..." />
      </Box>
    );

  if (!shareInfo) {
    return (
      <Box paddingX={2}>
        <Text color={theme.error}>Failed to generate share link</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      <Text dimColor>
        User: <Text bold>{shareInfo.email}</Text>
      </Text>
      <Box borderStyle="single" borderColor={theme.border} paddingX={1}>
        <Text wrap="wrap">{shareInfo.link}</Text>
      </Box>
      <Text dimColor italic>
        Press esc to go back
      </Text>
    </Box>
  );
}
