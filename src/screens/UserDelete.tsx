import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useServices } from '../contexts/ServiceContext.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useI18n } from '../contexts/I18nContext.js';
import { useUsers } from '../hooks/useUsers.js';
import { Select, type SelectItem } from '../components/Select.js';
import { Confirm } from '../components/Confirm.js';
import { Spinner } from '../components/Spinner.js';

type Phase = 'select' | 'confirm' | 'deleting';

export function UserDelete() {
  const { userManager } = useServices();
  const { goBack } = useNavigation();
  const { notify } = useNotification();
  const { t } = useI18n();
  const { users, loading } = useUsers();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);

  const handleUserSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser({ id: user.id, email: user.email ?? user.id.slice(0, 8) });
      setPhase('confirm');
    }
  };

  const handleConfirm = async () => {
    if (!selectedUser) return;
    setPhase('deleting');
    try {
      await userManager.deleteUser(selectedUser.id);
      notify('success', `${selectedUser.email} deleted`);
      goBack();
    } catch (e) {
      notify('error', (e as Error).message);
      setPhase('select');
    }
  };

  if (loading)
    return (
      <Box paddingX={2}>
        <Spinner message={t.ui.processing} />
      </Box>
    );
  if (users.length === 0)
    return (
      <Box paddingX={2}>
        <Text dimColor>{t.ui.noUsers}</Text>
      </Box>
    );
  if (phase === 'deleting')
    return (
      <Box paddingX={2}>
        <Spinner message={t.ui.processing} />
      </Box>
    );

  if (phase === 'confirm' && selectedUser) {
    return (
      <Box paddingX={2}>
        <Confirm
          message={`${t.ui.delete_} ${selectedUser.email}?`}
          onConfirm={handleConfirm}
          onCancel={() => setPhase('select')}
          destructive
        />
      </Box>
    );
  }

  const items: SelectItem<string>[] = users.map((u) => ({
    label: u.email ?? u.id.slice(0, 8),
    value: u.id,
    hint: u.id.slice(0, 8),
  }));

  return (
    <Select items={items} onSelect={handleUserSelect} onCancel={goBack} title={t.ui.selectUser} />
  );
}
