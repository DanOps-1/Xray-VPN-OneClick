import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';

export interface Tab {
  id: string;
  title: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  isFocused?: boolean;
}

export function Tabs({
  tabs,
  activeTab: controlledTab,
  onTabChange,
  children,
  isFocused = true,
}: TabsProps) {
  const { theme } = useTheme();
  const [internalTab, setInternalTab] = useState(tabs[0]?.id ?? '');
  const activeTab = controlledTab ?? internalTab;

  const switchTab = useCallback(
    (direction: 1 | -1) => {
      const idx = tabs.findIndex((t) => t.id === activeTab);
      const next = (idx + direction + tabs.length) % tabs.length;
      const newId = tabs[next]!.id;
      setInternalTab(newId);
      onTabChange?.(newId);
    },
    [tabs, activeTab, onTabChange]
  );

  useInput(
    (input, key) => {
      if (key.tab && !key.shift) {
        switchTab(1);
      } else if (key.tab && key.shift) {
        switchTab(-1);
      } else if (key.rightArrow) {
        switchTab(1);
      } else if (key.leftArrow) {
        switchTab(-1);
      }
    },
    { isActive: isFocused }
  );

  return (
    <Box flexDirection="column">
      <Box gap={1}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Box key={tab.id}>
              <Text
                color={isActive ? theme.primary : theme.inactive}
                bold={isActive}
                underline={isActive}
              >
                {tab.title}
              </Text>
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1} flexDirection="column">
        {children}
      </Box>
    </Box>
  );
}
