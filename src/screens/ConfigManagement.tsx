import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../components/design-system/ThemeProvider.js';
import { useServices } from '../contexts/ServiceContext.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { Select, type SelectItem } from '../components/Select.js';
import { Confirm } from '../components/Confirm.js';
import { Spinner } from '../components/Spinner.js';
import { KeyValue } from '../components/KeyValue.js';

type Phase = 'menu' | 'confirm-restore' | 'operating';

export function ConfigManagement() {
  const { theme } = useTheme();
  const { configManager } = useServices();
  const { goBack } = useNavigation();
  const { notify } = useNotification();
  const [phase, setPhase] = useState<Phase>('menu');
  const [configSummary, setConfigSummary] = useState<Record<string, string> | null>(null);
  const [backups, setBackups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [restorePath, setRestorePath] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const config = await configManager.readConfig();
        const inbound = config.inbounds?.[0];
        setConfigSummary({
          Protocol: inbound?.protocol ?? 'unknown',
          Port: String(inbound?.port ?? '-'),
          Network: (inbound?.streamSettings?.network as string) ?? '-',
          Security: (inbound?.streamSettings?.security as string) ?? '-',
        });
        setBackups(await configManager.listBackups());
      } catch {
        /* config may not exist */
      }
      setLoading(false);
    })();
  }, [configManager]);

  const handleBackup = async () => {
    setPhase('operating');
    try {
      const path = await configManager.backupConfig();
      notify('success', `Backed up to ${path}`);
      setBackups(await configManager.listBackups());
    } catch (e) {
      notify('error', `Backup failed: ${(e as Error).message}`);
    }
    setPhase('menu');
  };

  const handleRestore = async () => {
    if (!restorePath) return;
    setPhase('operating');
    try {
      await configManager.restoreConfig(restorePath);
      notify('success', 'Config restored');
    } catch (e) {
      notify('error', `Restore failed: ${(e as Error).message}`);
    }
    setRestorePath(null);
    setPhase('menu');
  };

  if (loading || phase === 'operating') {
    return (
      <Box paddingX={2}>
        <Spinner message={phase === 'operating' ? 'Processing...' : 'Loading config...'} />
      </Box>
    );
  }

  if (phase === 'confirm-restore' && restorePath) {
    return (
      <Box paddingX={2}>
        <Confirm
          message="Restore this backup? Current config will be overwritten."
          onConfirm={handleRestore}
          onCancel={() => {
            setRestorePath(null);
            setPhase('menu');
          }}
          destructive
        />
      </Box>
    );
  }

  const menuItems: SelectItem<string>[] = [
    { label: 'Create Backup', value: 'backup', hint: `${backups.length} existing` },
    ...(backups.length > 0
      ? backups.slice(0, 5).map((b) => ({
          label: `Restore: ${b.split('/').pop() ?? b}`,
          value: `restore:${b}`,
        }))
      : []),
  ];

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      {/* Current config summary */}
      {configSummary && (
        <Box flexDirection="column">
          {Object.entries(configSummary).map(([k, v]) => (
            <KeyValue key={k} label={k} value={v} labelWidth={10} />
          ))}
        </Box>
      )}

      <Select
        items={menuItems}
        onSelect={(v) => {
          if (v === 'backup') handleBackup();
          else if (v.startsWith('restore:')) {
            setRestorePath(v.slice(8));
            setPhase('confirm-restore');
          }
        }}
        onCancel={goBack}
      />
    </Box>
  );
}
