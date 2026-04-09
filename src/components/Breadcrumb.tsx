import React from 'react';
import { Box, Text } from 'ink';
import { useNavigation } from '../contexts/NavigationContext.js';

export function Breadcrumb() {
  const { breadcrumb } = useNavigation();

  if (breadcrumb.length <= 1) return null;

  return (
    <Box>
      {breadcrumb.map((segment, i) => {
        const isLast = i === breadcrumb.length - 1;
        return (
          <Text key={i}>
            {i > 0 && <Text dimColor> {'>'} </Text>}
            <Text dimColor={!isLast} bold={isLast}>
              {segment}
            </Text>
          </Text>
        );
      })}
    </Box>
  );
}
