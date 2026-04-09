import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useServices } from '../contexts/ServiceContext.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useUsers } from '../hooks/useUsers.js';
import { Select, type SelectItem } from '../components/Select.js';
import { TextInput } from '../components/TextInput.js';
import { Spinner } from '../components/Spinner.js';

type Phase = 'select-user' | 'enter-quota' | 'setting';

const PRESETS: SelectItem<string>[] = [
  { label: '1 GB', value: '1073741824' },
  { label: '5 GB', value: '5368709120' },
  { label: '10 GB', value: '10737418240' },
  { label: '50 GB', value: '53687091200' },
  { label: '100 GB', value: '107374182400' },
  { label: 'Unlimited', value: '0' },
  { label: 'Custom...', value: 'custom' },
];

function parseQuota(input: string): number | null {
  const m = input.trim().match(/^(\d+(?:\.\d+)?)\s*(gb|mb|tb)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]!);
  const u = (m[2] ?? 'gb').toLowerCase();
  if (u === 'tb') return n * 1099511627776;
  if (u === 'gb') return n * 1073741824;
  if (u === 'mb') return n * 1048576;
  return n;
}

export function QuotaSet() {
  const { quotaManager } = useServices();
  const { goBack } = useNavigation();
  const { notify } = useNotification();
  const { users, loading: usersLoading } = useUsers();
  const [phase, setPhase] = useState<Phase>('select-user');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [customMode, setCustomMode] = useState(false);

  const applyQuota = async (bytes: number) => {
    setPhase('setting');
    try {
      await quotaManager.setQuota({
        email: selectedEmail,
        quotaBytes: bytes,
        quotaType: bytes > 0 ? 'limited' : 'unlimited',
      });
      notify('success', `Quota set for ${selectedEmail}`);
      goBack();
    } catch (e) {
      notify('error', `Failed: ${(e as Error).message}`);
      setPhase('enter-quota');
    }
  };

  if (usersLoading)
    return (
      <Box paddingX={2}>
        <Spinner message="Loading..." />
      </Box>
    );
  if (phase === 'setting')
    return (
      <Box paddingX={2}>
        <Spinner message="Setting quota..." />
      </Box>
    );

  if (phase === 'select-user') {
    const items: SelectItem<string>[] = users.map((u) => ({
      label: u.email ?? u.id.slice(0, 8),
      value: u.email ?? u.id,
    }));
    return (
      <Select
        items={items}
        onSelect={(e) => {
          setSelectedEmail(e);
          setPhase('enter-quota');
        }}
        onCancel={goBack}
        title="Select user:"
      />
    );
  }

  if (customMode) {
    return (
      <Box flexDirection="column" paddingX={2} gap={1}>
        <Text dimColor>
          User: <Text bold>{selectedEmail}</Text>
        </Text>
        <TextInput
          label="Quota (e.g. 10GB, 500MB):"
          onSubmit={(val) => {
            const bytes = parseQuota(val);
            if (bytes !== null) applyQuota(bytes);
          }}
          onCancel={() => setCustomMode(false)}
          validator={(v) => (parseQuota(v) === null ? 'e.g. 10GB, 500MB, 1TB' : null)}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box paddingX={2}>
        <Text dimColor>
          User: <Text bold>{selectedEmail}</Text>
        </Text>
      </Box>
      <Select
        items={PRESETS}
        onSelect={(v) => (v === 'custom' ? setCustomMode(true) : applyQuota(parseInt(v, 10)))}
        onCancel={goBack}
        title="Select quota:"
      />
    </Box>
  );
}
