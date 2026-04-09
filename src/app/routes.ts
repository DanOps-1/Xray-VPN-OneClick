export type Route =
  | { screen: 'main-menu' }
  | { screen: 'service-status' }
  | { screen: 'user-management' }
  | { screen: 'user-add' }
  | { screen: 'user-delete' }
  | { screen: 'user-share'; userId?: string }
  | { screen: 'quota-management' }
  | { screen: 'quota-set' }
  | { screen: 'quota-details'; email?: string }
  | { screen: 'config-management' }
  | { screen: 'log-viewer' }
  | { screen: 'online-users' }
  | { screen: 'subscriptions' }
  | { screen: 'command-palette' };

export const SCREEN_TITLES: Record<Route['screen'], string> = {
  'main-menu': 'Home',
  'service-status': 'Service Status',
  'user-management': 'User Management',
  'user-add': 'Add User',
  'user-delete': 'Delete User',
  'user-share': 'Share Link',
  'quota-management': 'Quota Management',
  'quota-set': 'Set Quota',
  'quota-details': 'Quota Details',
  'config-management': 'Configuration',
  'log-viewer': 'Log Viewer',
  'online-users': 'Online Users',
  subscriptions: 'Subscriptions',
  'command-palette': 'Command Palette',
};
