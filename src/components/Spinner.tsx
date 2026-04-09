import React, { useState, useEffect } from 'react';
import { Text } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';
import { resolveColor } from './design-system/theme.js';

const FRAMES = [
  '\u280b',
  '\u2819',
  '\u2839',
  '\u2838',
  '\u283c',
  '\u2834',
  '\u2826',
  '\u2827',
  '\u2807',
  '\u280f',
];

interface SpinnerProps {
  message?: string;
  color?: string;
}

export function Spinner({ message, color = 'primary' }: SpinnerProps) {
  const { theme } = useTheme();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % FRAMES.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const resolvedColor = resolveColor(color, theme)!;

  return (
    <Text>
      <Text color={resolvedColor}>{FRAMES[frame]}</Text>
      {message && <Text color={theme.text}> {message}</Text>}
    </Text>
  );
}
