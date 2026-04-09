import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../components/design-system/ThemeProvider.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useI18n } from '../contexts/I18nContext.js';
import { useUsers } from '../hooks/useUsers.js';
import { Table, type Column } from '../components/Table.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Spinner } from '../components/Spinner.js';

export function UserManagement() {
  const { theme } = useTheme();
  const { navigate } = useNavigation();
  const { t } = useI18n();
  const { users, loading } = useUsers();

  useInput((input) => {
    if (input === 'a') navigate({ screen: 'user-add' });
    else if (input === 'd') navigate({ screen: 'user-delete' });
    else if (input === 's') navigate({ screen: 'user-share' });
  });

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'email', header: t.ui.email, width: 20 },
    {
      key: 'id',
      header: t.ui.uuid,
      width: 14,
      render: (row) => <Text dimColor>{String(row.id ?? '').slice(0, 8)}...</Text>,
    },
    {
      key: 'expiry',
      header: t.ui.expiry,
      width: 12,
      render: (row) => {
        const expiry = row.expiryDate as string | undefined;
        if (!expiry) return <Text dimColor>-</Text>;
        const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
        if (days <= 0)
          return (
            <Text color={theme.error} bold>
              {t.ui.expired}
            </Text>
          );
        if (days <= 3)
          return (
            <Text color={theme.warning}>
              {days}
              {t.ui.daysLeft}
            </Text>
          );
        return (
          <Text>
            {days}
            {t.ui.daysLeft}
          </Text>
        );
      },
    },
    {
      key: 'status',
      header: t.status.serviceStatus.split(' ')[0] ?? 'Status',
      width: 10,
      render: (row) => {
        const s = (row.status as string) ?? 'active';
        return (
          <StatusBadge
            status={s === 'exceeded' ? 'exceeded' : s === 'disabled' ? 'disabled' : 'ok'}
          />
        );
      },
    },
  ];

  const tableData = users.map((u) => ({
    email: u.email ?? u.id?.slice(0, 8) ?? '?',
    id: u.id ?? '',
    status: u.status ?? 'active',
    expiryDate: u.expiryDate,
  }));

  if (loading) {
    return (
      <Box paddingX={2}>
        <Spinner message={t.ui.processing} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      <Table
        columns={columns}
        data={tableData}
        onSelect={(row) => navigate({ screen: 'user-share', userId: row.id as string })}
        emptyMessage={t.ui.noUsers}
      />

      <Text dimColor>
        {users.length} {t.ui.users} <Text bold>a</Text> {t.ui.add} <Text bold>d</Text>{' '}
        {t.ui.delete_} <Text bold>s</Text> {t.ui.share} <Text bold>enter</Text> {t.ui.details}
      </Text>
    </Box>
  );
}
