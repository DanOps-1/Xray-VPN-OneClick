import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';

export interface Column<T> {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  maxRows?: number;
  onSelect?: (row: T, index: number) => void;
  emptyMessage?: string;
  isFocused?: boolean;
}

function padStr(str: string, width: number, align: 'left' | 'right' | 'center' = 'left'): string {
  const len = str.length;
  if (len >= width) return str.slice(0, width);
  const diff = width - len;
  if (align === 'right') return ' '.repeat(diff) + str;
  if (align === 'center') {
    const left = Math.floor(diff / 2);
    return ' '.repeat(left) + str + ' '.repeat(diff - left);
  }
  return str + ' '.repeat(diff);
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  maxRows = 15,
  onSelect,
  emptyMessage = 'No data',
  isFocused = true,
}: TableProps<T>) {
  const { theme } = useTheme();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const termWidth = process.stdout.columns || 80;
  const defaultColWidth = Math.max(
    8,
    Math.floor((termWidth - columns.length * 3) / columns.length)
  );

  useInput(
    (input, key) => {
      if (key.upArrow || input === 'k') {
        setSelectedIdx((prev) => {
          const next = Math.max(0, prev - 1);
          if (next < scrollOffset) setScrollOffset(next);
          return next;
        });
      } else if (key.downArrow || input === 'j') {
        setSelectedIdx((prev) => {
          const next = Math.min(data.length - 1, prev + 1);
          if (next >= scrollOffset + maxRows) setScrollOffset(next - maxRows + 1);
          return next;
        });
      } else if (key.return && onSelect && data[selectedIdx]) {
        onSelect(data[selectedIdx]!, selectedIdx);
      }
    },
    { isActive: isFocused && data.length > 0 }
  );

  if (data.length === 0) {
    return (
      <Box>
        <Text color={theme.inactive}>{emptyMessage}</Text>
      </Box>
    );
  }

  const visibleData = data.slice(scrollOffset, scrollOffset + maxRows);

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box>
        <Text color={theme.subtle}>{'  '}</Text>
        {columns.map((col, ci) => (
          <Box key={col.key} width={col.width ?? defaultColWidth}>
            <Text color={theme.inactive} bold>
              {padStr(col.header, (col.width ?? defaultColWidth) - 2, col.align)}
            </Text>
            {ci < columns.length - 1 && <Text color={theme.border}>{' \u2502 '}</Text>}
          </Box>
        ))}
      </Box>

      {/* Separator */}
      <Box>
        <Text color={theme.border}>
          {'  '}
          {columns
            .map((col) => '\u2500'.repeat((col.width ?? defaultColWidth) - 1))
            .join('\u2500\u253c\u2500')}
        </Text>
      </Box>

      {/* Rows */}
      {visibleData.map((row, vi) => {
        const realIdx = vi + scrollOffset;
        const isSelected = realIdx === selectedIdx;

        return (
          <Box key={vi}>
            <Text color={isSelected ? theme.primary : theme.subtle}>
              {isSelected ? '\u276f ' : '  '}
            </Text>
            {columns.map((col, ci) => {
              const cellContent = col.render ? col.render(row) : String(row[col.key] ?? '');
              const w = col.width ?? defaultColWidth;

              return (
                <Box key={col.key} width={w}>
                  {typeof cellContent === 'string' ? (
                    <Text color={isSelected ? theme.text : theme.text}>
                      {padStr(cellContent, w - 2, col.align)}
                    </Text>
                  ) : (
                    cellContent
                  )}
                  {ci < columns.length - 1 && <Text color={theme.border}>{' \u2502 '}</Text>}
                </Box>
              );
            })}
          </Box>
        );
      })}

      {/* Footer info */}
      {data.length > maxRows && (
        <Box marginTop={1}>
          <Text color={theme.subtle}>
            Showing {scrollOffset + 1}-{Math.min(scrollOffset + maxRows, data.length)} of{' '}
            {data.length}
          </Text>
        </Box>
      )}
    </Box>
  );
}
