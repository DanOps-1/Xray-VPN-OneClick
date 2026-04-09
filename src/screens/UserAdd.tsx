import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '../components/design-system/ThemeProvider.js';
import { useServices } from '../contexts/ServiceContext.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useI18n } from '../contexts/I18nContext.js';
import { TextInput } from '../components/TextInput.js';
import { Spinner } from '../components/Spinner.js';

export function UserAdd() {
  const { theme } = useTheme();
  const { userManager } = useServices();
  const { goBack } = useNavigation();
  const { notify } = useNotification();
  const { t } = useI18n();
  const [phase, setPhase] = useState<'email' | 'expiry' | 'adding'>('email');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ email: string; id: string; expiryDate?: string } | null>(
    null
  );

  const handleEmailSubmit = (value: string) => {
    if (!value.trim()) return;
    setEmail(value.trim());
    setPhase('expiry');
  };

  const handleExpirySubmit = async (daysStr: string) => {
    setPhase('adding');
    const days = daysStr.trim() ? parseInt(daysStr.trim(), 10) : undefined;
    try {
      const user = await userManager.addUser({
        email,
        expiryDays: days && days > 0 ? days : undefined,
      });
      setResult({ email: user.email ?? email, id: user.id, expiryDate: user.expiryDate });
      notify('success', t.ui.userCreated);
    } catch (e) {
      notify('error', (e as Error).message);
      setPhase('email');
    }
  };

  if (result) {
    return (
      <Box flexDirection="column" paddingX={2} gap={1}>
        <Text color={theme.success} bold>
          {'\u2713'} {t.ui.userCreated}
        </Text>
        <Box flexDirection="column">
          <Text dimColor>
            {t.ui.email}: <Text color={theme.text}>{result.email}</Text>
          </Text>
          <Text dimColor>
            {t.ui.uuid}: <Text color={theme.text}>{result.id}</Text>
          </Text>
          <Text dimColor>
            {t.ui.expiry}:{' '}
            <Text color={theme.text}>
              {result.expiryDate ? new Date(result.expiryDate).toLocaleDateString() : t.ui.never}
            </Text>
          </Text>
        </Box>
        <Text dimColor italic>
          {t.ui.pressEscBack}
        </Text>
      </Box>
    );
  }

  if (phase === 'adding') {
    return (
      <Box paddingX={2}>
        <Spinner message={t.ui.processing} />
      </Box>
    );
  }

  if (phase === 'expiry') {
    return (
      <Box flexDirection="column" paddingX={2} gap={1}>
        <Text dimColor>
          {t.ui.email}: {email}
        </Text>
        <TextInput
          label={t.ui.expiryDaysPrompt}
          placeholder="30"
          onSubmit={handleExpirySubmit}
          onCancel={() => setPhase('email')}
          validator={(v) => {
            if (v.trim() && (isNaN(Number(v)) || Number(v) < 0)) return 'Invalid number';
            return null;
          }}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2}>
      <TextInput
        label={t.ui.emailPrompt}
        placeholder="user@example.com"
        onSubmit={handleEmailSubmit}
        onCancel={goBack}
        validator={(v) => {
          if (!v.includes('@')) return 'Invalid email';
          return null;
        }}
      />
    </Box>
  );
}
