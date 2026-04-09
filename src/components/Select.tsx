import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';

export interface SelectItem<T = string> {
  label: string;
  value: T;
  description?: string;
  hint?: string;
  disabled?: boolean;
}

export interface SelectSeparator {
  separator: true;
  label?: string;
}

export type SelectOption<T = string> = SelectItem<T> | SelectSeparator;

function isSeparator<T>(opt: SelectOption<T>): opt is SelectSeparator {
  return 'separator' in opt && opt.separator === true;
}

interface SelectProps<T = string> {
  items: SelectOption<T>[];
  onSelect: (value: T) => void;
  onCancel?: () => void;
  title?: string;
  visibleCount?: number;
  isFocused?: boolean;
}

export function Select<T = string>({
  items,
  onSelect,
  onCancel,
  title,
  visibleCount = 14,
  isFocused = true,
}: SelectProps<T>) {
  const { theme } = useTheme();
  const selectableIndices = items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => !isSeparator(item) && !(item as SelectItem<T>).disabled)
    .map(({ i }) => i);

  const [focusedIdx, setFocusedIdx] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const currentIndex = selectableIndices[focusedIdx] ?? 0;

  const navigate = useCallback(
    (direction: 1 | -1) => {
      setFocusedIdx((prev) => {
        const next = prev + direction;
        if (next < 0) return selectableIndices.length - 1;
        if (next >= selectableIndices.length) return 0;
        return next;
      });
    },
    [selectableIndices.length]
  );

  useInput(
    (input, key) => {
      if (key.upArrow || input === 'k') navigate(-1);
      else if (key.downArrow || input === 'j') navigate(1);
      else if (key.return) {
        const item = items[currentIndex];
        if (item && !isSeparator(item) && !item.disabled) onSelect(item.value);
      } else if (key.escape && onCancel) onCancel();
    },
    { isActive: isFocused }
  );

  // Scroll tracking
  const effectiveOffset = (() => {
    let off = scrollOffset;
    if (currentIndex < off) off = currentIndex;
    if (currentIndex >= off + visibleCount) off = currentIndex - visibleCount + 1;
    if (off !== scrollOffset) setScrollOffset(off);
    return off;
  })();

  const visibleItems = items.slice(effectiveOffset, effectiveOffset + visibleCount);
  const hasMore = effectiveOffset + visibleCount < items.length;
  const hasLess = effectiveOffset > 0;

  return (
    <Box flexDirection="column" paddingX={2}>
      {title && (
        <Box marginBottom={1}>
          <Text dimColor>{title}</Text>
        </Box>
      )}

      {hasLess && <Text dimColor> {'...'}</Text>}

      {visibleItems.map((item, vi) => {
        const realIdx = vi + effectiveOffset;

        if (isSeparator(item)) {
          return (
            <Box key={`sep-${realIdx}`} marginY={0}>
              <Text dimColor> {'─'.repeat(30)}</Text>
            </Box>
          );
        }

        const isActive = realIdx === currentIndex;
        const si = item as SelectItem<T>;

        return (
          <Box key={`i-${realIdx}`}>
            <Text color={isActive ? theme.primary : undefined}>
              {isActive ? ' \u276f ' : '   '}
            </Text>
            <Text
              color={si.disabled ? theme.inactive : isActive ? theme.primary : undefined}
              bold={isActive}
              dimColor={si.disabled}
            >
              {si.label}
            </Text>
            {si.hint && <Text dimColor> {si.hint}</Text>}
          </Box>
        );
      })}

      {hasMore && <Text dimColor> {'...'}</Text>}
    </Box>
  );
}
