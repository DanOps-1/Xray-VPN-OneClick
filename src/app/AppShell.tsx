import React, { useState } from 'react';
import { Box, useInput, useApp } from 'ink';
import { Header } from '../components/design-system/Header.js';
import { StatusBar } from '../components/design-system/StatusBar.js';
import { Divider } from '../components/design-system/Divider.js';
import { Breadcrumb } from '../components/Breadcrumb.js';
import { Dashboard } from '../components/Dashboard.js';
import { Toast } from '../components/Toast.js';
import { CommandPalette, type CommandItem } from '../components/CommandPalette.js';
import { Router } from './Router.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useDashboardData } from '../hooks/useDashboardData.js';

interface AppShellProps {
  version: string;
}

export function AppShell({ version }: AppShellProps) {
  const { exit } = useApp();
  const { currentRoute, goBack, canGoBack, navigate, reset } = useNavigation();
  const { notifications, dismiss } = useNotification();
  const { data: dashboardData, loading: dashboardLoading } = useDashboardData();
  const [showPalette, setShowPalette] = useState(false);

  const commandItems: CommandItem[] = [
    { label: 'Service Status', value: 'service-status', category: 'Service' },
    { label: 'Online Users', value: 'online-users', category: 'Monitor' },
    { label: 'User Management', value: 'user-management', category: 'Users' },
    { label: 'Add User', value: 'user-add', category: 'Users' },
    { label: 'Traffic & Quotas', value: 'quota-management', category: 'Quotas' },
    { label: 'Set Quota', value: 'quota-set', category: 'Quotas' },
    { label: 'Subscriptions', value: 'subscriptions', category: 'Service' },
    { label: 'Configuration', value: 'config-management', category: 'System' },
    { label: 'View Logs', value: 'log-viewer', category: 'System' },
  ];

  useInput((input, key) => {
    if (showPalette) return;
    if (input === '/' && currentRoute.screen !== 'command-palette') {
      setShowPalette(true);
    } else if (key.escape) {
      if (canGoBack) goBack();
    } else if (input === 'q') {
      if (currentRoute.screen === 'main-menu') exit();
      else reset();
    }
  });

  const handlePaletteSelect = (value: string) => {
    setShowPalette(false);
    navigate({ screen: value } as { screen: 'service-status' });
  };

  const serviceStatus = dashboardData?.serviceActive
    ? ('running' as const)
    : dashboardData
      ? ('stopped' as const)
      : ('loading' as const);

  const isHome = currentRoute.screen === 'main-menu';

  return (
    <Box flexDirection="column">
      {/* Header: title + service status */}
      <Header version={version} serviceStatus={serviceStatus} uptime={dashboardData?.uptime} />

      {/* Dashboard: only on home screen */}
      {isHome && (
        <>
          <Dashboard data={dashboardData} loading={dashboardLoading} />
          <Divider />
        </>
      )}

      {/* Breadcrumb: only when navigated away from home */}
      {!isHome && (
        <Box paddingX={2} paddingBottom={1}>
          <Breadcrumb />
        </Box>
      )}

      {/* Command Palette overlay */}
      {showPalette && (
        <Box paddingX={2}>
          <CommandPalette
            items={commandItems}
            onSelect={handlePaletteSelect}
            onCancel={() => setShowPalette(false)}
          />
        </Box>
      )}

      {/* Main content */}
      {!showPalette && <Router />}

      {/* Notifications */}
      {notifications.length > 0 && (
        <Box flexDirection="column" paddingX={2} paddingTop={1}>
          {notifications.map((n) => (
            <Toast key={n.id} type={n.type} message={n.message} onDismiss={() => dismiss(n.id)} />
          ))}
        </Box>
      )}

      {/* Status bar */}
      <Divider />
      <StatusBar />
    </Box>
  );
}
