import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../components/design-system/ThemeProvider.js';
import { useServices } from '../contexts/ServiceContext.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useI18n } from '../contexts/I18nContext.js';
import { KeyValue } from '../components/KeyValue.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Spinner } from '../components/Spinner.js';
import { Confirm } from '../components/Confirm.js';
import { formatBytes } from '../utils/format.js';
import { type Route } from '../app/routes.js';
import { type TrafficQuota } from '../types/quota.js';

export function QuotaDetails() {
  const { theme } = useTheme();
  const { quotaManager } = useServices();
  const { currentRoute } = useNavigation();
  const { notify } = useNotification();
  const { t } = useI18n();
  const email = (currentRoute as Extract<Route, { screen: 'quota-details' }>).email ?? '';
  const [quota, setQuota] = useState<TrafficQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'reenable' | null>(null);

  const fetchQuota = async () => {
    try {
      setQuota(await quotaManager.getQuota(email));
    } catch {
      setQuota(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, [email]);

  useInput((input) => {
    if (input === 'r') setConfirmAction('reset');
    else if (input === 'e') setConfirmAction('reenable');
  });

  const handleReset = async () => {
    try {
      await quotaManager.resetUsage(email);
      notify('success', t.messages.quotaReset);
      fetchQuota();
    } catch (e) {
      notify('error', (e as Error).message);
    }
    setConfirmAction(null);
  };

  const handleReenable = async () => {
    try {
      await quotaManager.setStatus(email, 'active');
      notify('success', t.messages.userReenabled);
      fetchQuota();
    } catch (e) {
      notify('error', (e as Error).message);
    }
    setConfirmAction(null);
  };

  if (loading)
    return (
      <Box paddingX={2}>
        <Spinner message={t.ui.processing} />
      </Box>
    );

  if (confirmAction === 'reset') {
    return (
      <Box paddingX={2}>
        <Confirm
          message={t.quota.confirmReset}
          onConfirm={handleReset}
          onCancel={() => setConfirmAction(null)}
        />
      </Box>
    );
  }
  if (confirmAction === 'reenable') {
    return (
      <Box paddingX={2}>
        <Confirm
          message={t.quota.confirmReenable}
          onConfirm={handleReenable}
          onCancel={() => setConfirmAction(null)}
        />
      </Box>
    );
  }

  if (!quota)
    return (
      <Box paddingX={2}>
        <Text dimColor>
          {t.quota.noQuota} ({email})
        </Text>
      </Box>
    );

  const ratio = quota.quotaBytes > 0 ? quota.usedBytes / quota.quotaBytes : 0;
  const remaining = quota.quotaBytes > 0 ? Math.max(0, quota.quotaBytes - quota.usedBytes) : -1;
  const labelW = 12;
  const badgeStatus =
    quota.status === 'exceeded'
      ? ('exceeded' as const)
      : quota.status === 'disabled'
        ? ('disabled' as const)
        : quota.quotaBytes > 0 && ratio >= 0.8
          ? ('warning' as const)
          : ('ok' as const);

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      <Text bold>{email}</Text>
      <Box flexDirection="column">
        <KeyValue label="Status" labelWidth={labelW} value={<StatusBadge status={badgeStatus} />} />
        <KeyValue
          label={t.quota.title.split(' ')[0] ?? 'Quota'}
          labelWidth={labelW}
          value={quota.quotaBytes > 0 ? formatBytes(quota.quotaBytes) : t.ui.unlimited}
        />
        <KeyValue label={t.quota.used} labelWidth={labelW} value={formatBytes(quota.usedBytes)} />
        {remaining >= 0 && (
          <KeyValue label={t.quota.remaining} labelWidth={labelW} value={formatBytes(remaining)} />
        )}
      </Box>
      {quota.quotaBytes > 0 && <ProgressBar ratio={ratio} width={30} />}
      <Text dimColor>
        <Text bold>r</Text> {t.ui.resetUsage} <Text bold>e</Text> {t.ui.reenable}{' '}
        <Text bold>esc</Text> {t.ui.back}
      </Text>
    </Box>
  );
}
