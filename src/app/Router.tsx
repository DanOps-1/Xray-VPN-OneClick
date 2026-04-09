import React from 'react';
import { useNavigation } from '../contexts/NavigationContext.js';
import { MainMenu } from '../screens/MainMenu.js';
import { ServiceStatus } from '../screens/ServiceStatus.js';
import { UserManagement } from '../screens/UserManagement.js';
import { UserAdd } from '../screens/UserAdd.js';
import { UserDelete } from '../screens/UserDelete.js';
import { UserShare } from '../screens/UserShare.js';
import { QuotaManagement } from '../screens/QuotaManagement.js';
import { QuotaSet } from '../screens/QuotaSet.js';
import { QuotaDetails } from '../screens/QuotaDetails.js';
import { ConfigManagement } from '../screens/ConfigManagement.js';
import { LogViewer } from '../screens/LogViewer.js';
import { OnlineUsers } from '../screens/OnlineUsers.js';
import { SubscriptionManagement } from '../screens/SubscriptionManagement.js';

export function Router() {
  const { currentRoute } = useNavigation();

  switch (currentRoute.screen) {
    case 'main-menu':
      return <MainMenu />;
    case 'service-status':
      return <ServiceStatus />;
    case 'user-management':
      return <UserManagement />;
    case 'user-add':
      return <UserAdd />;
    case 'user-delete':
      return <UserDelete />;
    case 'user-share':
      return <UserShare />;
    case 'quota-management':
      return <QuotaManagement />;
    case 'quota-set':
      return <QuotaSet />;
    case 'quota-details':
      return <QuotaDetails />;
    case 'config-management':
      return <ConfigManagement />;
    case 'log-viewer':
      return <LogViewer />;
    case 'online-users':
      return <OnlineUsers />;
    case 'subscriptions':
      return <SubscriptionManagement />;
    default:
      return <MainMenu />;
  }
}
