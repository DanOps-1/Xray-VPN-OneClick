import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from './design-system/ThemeProvider.js';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
  mask?: string;
  validator?: (value: string) => string | null;
  isFocused?: boolean;
}

export function TextInput({
  label,
  placeholder,
  value: controlledValue,
  onChange,
  onSubmit,
  onCancel,
  mask,
  validator,
  isFocused = true,
}: TextInputProps) {
  const { theme } = useTheme();
  const [internalValue, setInternalValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cursorVisible, setCursorVisible] = useState(true);

  const value = controlledValue ?? internalValue;
  const setValue = (v: string) => {
    if (onChange) onChange(v);
    else setInternalValue(v);
    if (error) setError(null);
  };

  // Cursor blink
  React.useEffect(() => {
    const timer = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(timer);
  }, []);

  useInput(
    (input, key) => {
      if (key.return) {
        if (validator) {
          const err = validator(value);
          if (err) {
            setError(err);
            return;
          }
        }
        onSubmit(value);
      } else if (key.escape && onCancel) {
        onCancel();
      } else if (key.backspace || key.delete) {
        setValue(value.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setValue(value + input);
      }
    },
    { isActive: isFocused }
  );

  const displayValue = mask ? mask.repeat(value.length) : value;
  const cursor = cursorVisible ? '\u2588' : ' ';

  return (
    <Box flexDirection="column">
      <Box>
        {label && (
          <Text color={theme.primary} bold>
            {label}{' '}
          </Text>
        )}
        <Text color={theme.text}>
          {displayValue}
          <Text color={theme.primary}>{cursor}</Text>
        </Text>
        {!value && placeholder && <Text color={theme.subtle}>{placeholder}</Text>}
      </Box>
      {error && <Text color={theme.error}> {error}</Text>}
    </Box>
  );
}
