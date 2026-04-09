import React, { createContext, useContext, useState, useCallback } from 'react';
import { type ThemeName, type Theme, getTheme } from './theme.js';

interface ThemeContextValue {
  themeName: ThemeName;
  theme: Theme;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: 'dark',
  theme: getTheme('dark'),
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
  }, []);

  const value: ThemeContextValue = {
    themeName,
    theme: getTheme(themeName),
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
