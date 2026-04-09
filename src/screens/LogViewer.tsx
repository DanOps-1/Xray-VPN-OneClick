import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '../components/design-system/ThemeProvider.js';
import { useServices } from '../contexts/ServiceContext.js';
import { useI18n } from '../contexts/I18nContext.js';
import { Spinner } from '../components/Spinner.js';

interface LogLine {
  timestamp?: string;
  level?: string;
  message: string;
}

export function LogViewer() {
  const { theme } = useTheme();
  const { logManager } = useServices();
  const { t } = useI18n();
  const [logType, setLogType] = useState<'access' | 'error'>('access');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [follow, setFollow] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);

  const maxVisible = Math.max(5, (process.stdout.rows || 24) - 10);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const entries =
        logType === 'access'
          ? await logManager.readAccessLog(200)
          : await logManager.readErrorLog(200);
      setLogs(
        entries.map((e) => ({
          timestamp:
            e.timestamp instanceof Date
              ? e.timestamp.toISOString().slice(11, 19)
              : String(e.timestamp ?? ''),
          level: e.level,
          message: e.message,
        }))
      );
      if (follow) setScrollOffset(Math.max(0, entries.length - maxVisible));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [logType]);
  useEffect(() => {
    if (!follow) return;
    const timer = setInterval(fetchLogs, 3000);
    return () => clearInterval(timer);
  }, [follow, logType]);

  useInput((input, key) => {
    if (input === 'f') setFollow((p) => !p);
    else if (input === 't') setLogType((p) => (p === 'access' ? 'error' : 'access'));
    else if (key.upArrow || input === 'k') {
      setScrollOffset((p) => Math.max(0, p - 1));
      setFollow(false);
    } else if (key.downArrow || input === 'j')
      setScrollOffset((p) => Math.min(Math.max(0, logs.length - maxVisible), p + 1));
    else if (key.pageUp) {
      setScrollOffset((p) => Math.max(0, p - maxVisible));
      setFollow(false);
    } else if (key.pageDown)
      setScrollOffset((p) => Math.min(Math.max(0, logs.length - maxVisible), p + maxVisible));
  });

  const visibleLogs = logs.slice(scrollOffset, scrollOffset + maxVisible);

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      <Box gap={2}>
        <Text
          bold={logType === 'access'}
          dimColor={logType !== 'access'}
          underline={logType === 'access'}
        >
          {t.logs.accessLog}
        </Text>
        <Text
          bold={logType === 'error'}
          dimColor={logType !== 'error'}
          underline={logType === 'error'}
        >
          {t.logs.errorLog}
        </Text>
        {follow && (
          <Text color={theme.success} bold>
            FOLLOW
          </Text>
        )}
      </Box>

      {loading ? (
        <Spinner message={t.ui.processing} />
      ) : logs.length === 0 ? (
        <Text dimColor>{t.ui.noEntries}</Text>
      ) : (
        <Box flexDirection="column">
          {visibleLogs.map((line, i) => (
            <Box key={i + scrollOffset}>
              {line.timestamp && <Text dimColor>{line.timestamp} </Text>}
              {line.level && (
                <Text
                  color={
                    line.level.toLowerCase().includes('err')
                      ? theme.error
                      : line.level.toLowerCase().includes('warn')
                        ? theme.warning
                        : undefined
                  }
                  bold={line.level.toLowerCase().includes('err')}
                >
                  {line.level.toUpperCase().padEnd(5)}{' '}
                </Text>
              )}
              <Text wrap="truncate-end">{line.message}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Text dimColor>
        {logs.length} {t.ui.entries} <Text bold>t</Text> {t.ui.switchLog} <Text bold>f</Text>{' '}
        {t.ui.follow}
        {follow ? ' (on)' : ''} <Text bold>{'\u2191\u2193'}</Text> {t.ui.scroll}
      </Text>
    </Box>
  );
}
