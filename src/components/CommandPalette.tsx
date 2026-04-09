import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import Fuse from 'fuse.js';
import { useTheme } from './design-system/ThemeProvider.js';

export interface CommandItem {
  label: string;
  value: string;
  icon?: string;
  category?: string;
}

interface CommandPaletteProps {
  items: CommandItem[];
  onSelect: (value: string) => void;
  onCancel: () => void;
}

export function CommandPalette({ items, onSelect, onCancel }: CommandPaletteProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  const fuse = useMemo(
    () => new Fuse(items, { keys: ['label', 'category'], threshold: 0.4 }),
    [items]
  );

  const results = useMemo(() => {
    if (!query) return items;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, items]);

  const visibleCount = Math.min(8, results.length);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.return) {
      const item = results[selectedIdx];
      if (item) onSelect(item.value);
    } else if (key.upArrow || (key.ctrl && input === 'p')) {
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (key.downArrow || (key.ctrl && input === 'n')) {
      setSelectedIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (key.backspace || key.delete) {
      setQuery((prev) => prev.slice(0, -1));
      setSelectedIdx(0);
    } else if (input && !key.ctrl && !key.meta) {
      setQuery((prev) => prev + input);
      setSelectedIdx(0);
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.primary}
      paddingX={1}
      paddingY={0}
    >
      {/* Search input */}
      <Box>
        <Text color={theme.primary} bold>
          {'/ '}
        </Text>
        <Text color={theme.text}>{query}</Text>
        <Text color={theme.primary}>{'\u2588'}</Text>
      </Box>

      {/* Results */}
      {results.slice(0, visibleCount).map((item, i) => {
        const isSelected = i === selectedIdx;
        return (
          <Box key={item.value}>
            <Text color={isSelected ? theme.primary : theme.subtle}>
              {isSelected ? '\u276f ' : '  '}
            </Text>
            {item.icon && <Text>{item.icon} </Text>}
            <Text color={isSelected ? theme.primary : theme.text} bold={isSelected}>
              {item.label}
            </Text>
            {item.category && <Text color={theme.subtle}> [{item.category}]</Text>}
          </Box>
        );
      })}

      {results.length === 0 && <Text color={theme.inactive}>No matches</Text>}
    </Box>
  );
}
