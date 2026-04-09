import React from 'react';
import { Box, Text } from 'ink';
import { useNavigation } from '../../contexts/NavigationContext.js';
import { useI18n } from '../../contexts/I18nContext.js';

export interface ShortcutHint {
  key: string;
  action: string;
}

interface StatusBarProps {
  hints?: ShortcutHint[];
}

export function StatusBar({ hints }: StatusBarProps) {
  const { canGoBack } = useNavigation();
  const { t } = useI18n();

  const effectiveHints = hints ?? [
    ...(canGoBack ? [{ key: 'esc', action: t.ui.back }] : []),
    { key: '\u2191\u2193', action: t.ui.navigate },
    { key: 'enter', action: t.ui.select },
    { key: '/', action: t.ui.search },
    { key: 'q', action: t.ui.quit },
  ];

  return (
    <Box paddingX={2}>
      {effectiveHints.map((hint, i) => (
        <Text key={i} dimColor>
          {i > 0 ? '  ' : ''}
          <Text bold>{hint.key}</Text> {hint.action}
        </Text>
      ))}
    </Box>
  );
}
