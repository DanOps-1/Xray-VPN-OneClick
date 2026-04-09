import React from 'react';
import { Box } from 'ink';
import { Select, type SelectOption } from '../components/Select.js';
import { useNavigation } from '../contexts/NavigationContext.js';
import { useI18n } from '../contexts/I18nContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useServices } from '../contexts/ServiceContext.js';
import { Spinner } from '../components/Spinner.js';
import { Confirm } from '../components/Confirm.js';

type MenuAction = string;

export function MainMenu() {
  const { navigate } = useNavigation();
  const { t, toggleLanguage, language } = useI18n();
  const { notify } = useNotification();
  const { systemdManager } = useServices();
  const [operating, setOperating] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<'stop' | 'restart' | null>(null);

  const langHint = language === 'en' ? 'EN / \u4e2d\u6587' : '\u4e2d\u6587 / EN';

  const items: SelectOption<MenuAction>[] = [
    { label: t.menu.viewStatus, value: 'service-status', hint: t.hints.viewDetails },
    { label: t.menu.startService, value: 'service-start' },
    { label: t.menu.stopService, value: 'service-stop' },
    { label: t.menu.restartService, value: 'service-restart' },
    { separator: true },
    { label: t.menu.onlineUsers, value: 'online-users', hint: t.hints.liveConnections },
    { label: t.menu.userManagement, value: 'user-management', hint: t.hints.addDeleteShare },
    { label: t.menu.quotaManagement, value: 'quota-management', hint: t.hints.limitsUsage },
    { label: t.menu.subscriptions, value: 'subscriptions', hint: t.hints.subLinkServer },
    { separator: true },
    { label: t.menu.configManagement, value: 'config-management', hint: t.hints.backupRestore },
    { label: t.menu.viewLogs, value: 'log-viewer', hint: t.hints.accessError },
    { separator: true },
    { label: t.menu.switchLanguage, value: 'switch-language', hint: langHint },
    { label: t.menu.exit, value: 'exit', hint: 'q' },
  ];

  const executeAction = async (action: 'start' | 'stop' | 'restart') => {
    setConfirmAction(null);
    setOperating(true);
    try {
      if (action === 'start') await systemdManager.start();
      else if (action === 'stop') await systemdManager.stop();
      else await systemdManager.restart();
      notify('success', `Service ${action}ed`);
    } catch (e) {
      notify('error', `${(e as Error).message}`);
    }
    setOperating(false);
  };

  const handleSelect = async (value: MenuAction) => {
    switch (value) {
      case 'service-status':
        navigate({ screen: 'service-status' });
        break;
      case 'service-start':
        executeAction('start');
        break;
      case 'service-stop':
        setConfirmAction('stop');
        break;
      case 'service-restart':
        setConfirmAction('restart');
        break;
      case 'online-users':
        navigate({ screen: 'online-users' });
        break;
      case 'user-management':
        navigate({ screen: 'user-management' });
        break;
      case 'quota-management':
        navigate({ screen: 'quota-management' });
        break;
      case 'subscriptions':
        navigate({ screen: 'subscriptions' });
        break;
      case 'config-management':
        navigate({ screen: 'config-management' });
        break;
      case 'log-viewer':
        navigate({ screen: 'log-viewer' });
        break;
      case 'switch-language':
        toggleLanguage();
        break;
      case 'exit':
        process.exit(0);
    }
  };

  if (confirmAction) {
    return (
      <Box paddingX={2}>
        <Confirm
          message={confirmAction === 'stop' ? t.ui.confirmStop : t.ui.confirmRestart}
          onConfirm={() => executeAction(confirmAction)}
          onCancel={() => setConfirmAction(null)}
          destructive
        />
      </Box>
    );
  }

  if (operating) {
    return (
      <Box paddingX={2}>
        <Spinner message={t.ui.processing} />
      </Box>
    );
  }

  return <Select items={items} onSelect={handleSelect} visibleCount={20} />;
}
