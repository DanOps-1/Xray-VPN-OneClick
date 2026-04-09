import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../components/design-system/ThemeProvider.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useI18n } from '../contexts/I18nContext.js';
import { useQuotas } from '../hooks/useQuotas.js';
import { Table, type Column } from '../components/Table.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Spinner } from '../components/Spinner.js';
import { formatBytes } from '../utils/format.js';

export function QuotaManagement() {
  const { theme } = useTheme();
  const { navigate } = useNavigation();
  const { t } = useI18n();
  const { quotas, loading } = useQuotas();

  useInput((input) => {
    if (input === 's') navigate({ screen: 'quota-set' });
  });

  const quotaEntries = Object.entries(quotas).map(([email, q]) => ({
    email,
    quota: q.quotaBytes > 0 ? formatBytes(q.quotaBytes) : t.ui.unlimited,
    used: formatBytes(q.usedBytes),
    ratio: q.quotaBytes > 0 ? q.usedBytes / q.quotaBytes : 0,
    status: q.status ?? 'active',
    quotaBytes: q.quotaBytes,
  }));

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'email', header: t.ui.email, width: 18 },
    { key: 'quota', header: t.quota.title.split(' ')[0] ?? 'Quota', width: 12 },
    { key: 'used', header: t.quota.used, width: 12 },
    {
      key: 'progress',
      header: '',
      width: 20,
      render: (row) => {
        if ((row.quotaBytes as number) <= 0) return <Text dimColor>{'\u2500'}</Text>;
        return <ProgressBar ratio={row.ratio as number} width={12} />;
      },
    },
    {
      key: 'status',
      header: '',
      width: 10,
      render: (row) => {
        const s = row.status as string;
        if (s === 'exceeded') return <StatusBadge status="exceeded" />;
        if (s === 'disabled') return <StatusBadge status="disabled" />;
        return <StatusBadge status="ok" />;
      },
    },
  ];

  if (loading)
    return (
      <Box paddingX={2}>
        <Spinner message={t.ui.processing} />
      </Box>
    );

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      <Table
        columns={columns}
        data={quotaEntries}
        onSelect={(row) => navigate({ screen: 'quota-details', email: row.email as string })}
        emptyMessage={t.ui.noQuotas}
      />
      <Text dimColor>
        {quotaEntries.length} {t.ui.entries} <Text bold>s</Text> {t.ui.setQuota}{' '}
        <Text bold>enter</Text> {t.ui.details}
      </Text>
    </Box>
  );
}
