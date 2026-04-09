import React from 'react';
import { ThemeProvider } from '../components/design-system/ThemeProvider.js';
import { I18nProvider } from '../contexts/I18nContext.js';
import { ServiceProvider, type ServiceOptions } from '../contexts/ServiceContext.js';
import { NavigationProvider } from '../contexts/NavigationContext.js';
import { NotificationProvider } from '../contexts/NotificationContext.js';
import { AppShell } from './AppShell.js';

interface AppProps {
  options: ServiceOptions;
  version: string;
}

export function App({ options, version }: AppProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <I18nProvider defaultLanguage="en">
        <ServiceProvider options={options}>
          <NavigationProvider>
            <NotificationProvider>
              <AppShell version={version} />
            </NotificationProvider>
          </NavigationProvider>
        </ServiceProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
