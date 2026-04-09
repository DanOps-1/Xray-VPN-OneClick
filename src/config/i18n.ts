/**
 * Internationalization (i18n) Configuration
 *
 * Provides language support for Chinese and English
 *
 * @module config/i18n
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/** Supported languages */
export type Language = 'zh' | 'en';

/** Language preference storage path */
const LANG_FILE = path.join(os.homedir(), '.xray-manager-lang');

/** Translation interface */
export interface Translations {
  // Menu items
  menu: {
    viewStatus: string;
    startService: string;
    stopService: string;
    restartService: string;
    userManagement: string;
    quotaManagement: string;
    configManagement: string;
    viewLogs: string;
    switchLanguage: string;
    exit: string;
    onlineUsers: string;
    subscriptions: string;
  };

  // Menu hints (shown next to menu items)
  hints: {
    viewDetails: string;
    liveConnections: string;
    addDeleteShare: string;
    limitsUsage: string;
    subLinkServer: string;
    backupRestore: string;
    accessError: string;
  };

  // Status labels
  status: {
    serviceStatus: string;
    userCount: string;
    active: string;
    inactive: string;
    unknown: string;
    running: string;
    stopped: string;
    loading: string;
    error: string;
  };

  // UI common
  ui: {
    navigate: string;
    select: string;
    search: string;
    quit: string;
    back: string;
    add: string;
    delete_: string;
    share: string;
    details: string;
    refresh: string;
    follow: string;
    scroll: string;
    switchLog: string;
    setQuota: string;
    resetUsage: string;
    reenable: string;
    start: string;
    stop: string;
    entries: string;
    users: string;
    noData: string;
    processing: string;
    autoRefresh: string;
    never: string;
    expired: string;
    daysLeft: string;
    unlimited: string;
    createBackup: string;
    existing: string;
    custom: string;
    confirmStop: string;
    confirmRestart: string;
    userCreated: string;
    email: string;
    uuid: string;
    expiry: string;
    expiryDaysPrompt: string;
    emailPrompt: string;
    selectUser: string;
    selectQuota: string;
    noUsers: string;
    noConnections: string;
    noEntries: string;
    noQuotas: string;
    pressEscBack: string;
  };

  // Quota labels
  quota: {
    title: string;
    list: string;
    set: string;
    show: string;
    reset: string;
    reenable: string;
    unlimited: string;
    used: string;
    remaining: string;
    exceeded: string;
    warning: string;
    normal: string;
    noQuota: string;
    selectUser: string;
    selectPreset: string;
    enterCustom: string;
    confirmReset: string;
    confirmReenable: string;
    executeCheck: string;
    checkComplete: string;
    normalUsers: string;
    warningUsers: string;
    exceededUsers: string;
    disabledUsers: string;
  };

  // Logs labels
  logs: {
    title: string;
    accessLog: string;
    errorLog: string;
    noLogs: string;
    logFileNotFound: string;
    logFileEmpty: string;
    showingLines: string;
  };

  // Config labels
  config: {
    title: string;
    viewConfig: string;
    backupConfig: string;
    restoreConfig: string;
    backupSuccess: string;
    restoreSuccess: string;
    noBackups: string;
    selectBackup: string;
    confirmRestore: string;
    restoreWarning: string;
  };

  // Public IP labels
  publicIp: {
    detecting: string;
    detected: string;
    detectionFailed: string;
    enterManually: string;
    invalidIp: string;
    saved: string;
    natDetected: string;
  };

  // Common actions
  actions: {
    selectAction: string;
    confirm: string;
    cancel: string;
    back: string;
  };

  // Messages
  messages: {
    languageSwitched: string;
    operationSuccess: string;
    operationFailed: string;
    thankYou: string;
    terminalTooNarrow: string;
    terminalTooShort: string;
    terminalResizeSuggestion: string;
    quotaSet: string;
    quotaReset: string;
    userReenabled: string;
    noUsersWithQuota: string;
    noDisabledUsers: string;
  };
}

/** Chinese translations */
const zhTranslations: Translations = {
  menu: {
    viewStatus: '服务状态',
    startService: '启动服务',
    stopService: '停止服务',
    restartService: '重启服务',
    userManagement: '用户管理',
    quotaManagement: '流量配额',
    configManagement: '配置管理',
    viewLogs: '查看日志',
    switchLanguage: '切换语言',
    exit: '退出',
    onlineUsers: '在线用户',
    subscriptions: '订阅链接',
  },
  hints: {
    viewDetails: '查看详情',
    liveConnections: '实时连接',
    addDeleteShare: '增 / 删 / 分享',
    limitsUsage: '限额与用量',
    subLinkServer: '订阅服务',
    backupRestore: '备份 / 恢复',
    accessError: '访问与错误',
  },
  status: {
    serviceStatus: '服务状态',
    userCount: '用户数',
    active: '运行中',
    inactive: '已停止',
    unknown: '未知',
    running: '运行中',
    stopped: '已停止',
    loading: '加载中',
    error: '错误',
  },
  ui: {
    navigate: '导航',
    select: '选择',
    search: '搜索',
    quit: '退出',
    back: '返回',
    add: '添加',
    delete_: '删除',
    share: '分享',
    details: '详情',
    refresh: '刷新',
    follow: '跟随',
    scroll: '滚动',
    switchLog: '切换日志',
    setQuota: '设置配额',
    resetUsage: '重置用量',
    reenable: '重新启用',
    start: '启动',
    stop: '停止',
    entries: '条记录',
    users: '用户',
    noData: '暂无数据',
    processing: '处理中...',
    autoRefresh: '自动刷新',
    never: '永不',
    expired: '已过期',
    daysLeft: '天后到期',
    unlimited: '无限制',
    createBackup: '创建备份',
    existing: '个已有',
    custom: '自定义...',
    confirmStop: '停止服务？活跃连接将断开。',
    confirmRestart: '重启服务？活跃连接将断开。',
    userCreated: '用户已创建',
    email: '邮箱',
    uuid: 'UUID',
    expiry: '到期',
    expiryDaysPrompt: '到期天数 (留空=永不):',
    emailPrompt: '邮箱:',
    selectUser: '选择用户:',
    selectQuota: '选择配额:',
    noUsers: '暂无用户',
    noConnections: '无活跃连接',
    noEntries: '暂无记录',
    noQuotas: '暂无配额配置',
    pressEscBack: '按 esc 返回',
  },
  quota: {
    title: '流量配额管理',
    list: '查看配额列表',
    set: '设置用户配额',
    show: '查看配额详情',
    reset: '重置已用流量',
    reenable: '重新启用用户',
    unlimited: '无限制',
    used: '已使用',
    remaining: '剩余',
    exceeded: '已超额',
    warning: '接近限额',
    normal: '正常',
    noQuota: '未设置配额',
    selectUser: '请选择用户',
    selectPreset: '请选择预设配额',
    enterCustom: '请输入自定义配额',
    confirmReset: '确定要重置该用户的已用流量吗？',
    confirmReenable: '确定要重新启用该用户吗？',
    executeCheck: '执行配额检查',
    checkComplete: '配额检查完成',
    normalUsers: '正常用户',
    warningUsers: '警告用户',
    exceededUsers: '超限用户',
    disabledUsers: '已禁用',
  },
  logs: {
    title: '日志查看',
    accessLog: '访问日志',
    errorLog: '错误日志',
    noLogs: '暂无日志',
    logFileNotFound: '日志文件不存在',
    logFileEmpty: '日志文件为空',
    showingLines: '显示最近 {lines} 行',
  },
  config: {
    title: '配置管理',
    viewConfig: '查看当前配置',
    backupConfig: '备份配置',
    restoreConfig: '恢复配置',
    backupSuccess: '配置已备份到: {path}',
    restoreSuccess: '配置已恢复',
    noBackups: '暂无备份文件',
    selectBackup: '请选择要恢复的备份',
    confirmRestore: '确定要恢复此备份吗？',
    restoreWarning: '恢复配置将覆盖当前配置并重启服务',
  },
  publicIp: {
    detecting: '正在检测公网 IP...',
    detected: '检测到公网 IP: {ip}',
    detectionFailed: '无法自动检测公网 IP',
    enterManually: '请手动输入公网 IP 地址',
    invalidIp: '无效的 IP 地址格式',
    saved: '公网 IP 已保存',
    natDetected: '检测到 NAT 环境 (私有 IP: {ip})',
  },
  actions: {
    selectAction: '请选择操作',
    confirm: '确认',
    cancel: '取消',
    back: '返回',
  },
  messages: {
    languageSwitched: '语言已切换为中文',
    operationSuccess: '操作成功',
    operationFailed: '操作失败',
    thankYou: '感谢使用 Xray Manager!',
    terminalTooNarrow: '终端宽度过窄',
    terminalTooShort: '终端高度过低',
    terminalResizeSuggestion: '请调整终端大小以获得最佳显示效果',
    quotaSet: '配额设置成功',
    quotaReset: '已用流量已重置',
    userReenabled: '用户已重新启用',
    noUsersWithQuota: '暂无设置配额的用户',
    noDisabledUsers: '暂无被禁用的用户',
  },
};

/** English translations */
const enTranslations: Translations = {
  menu: {
    viewStatus: 'Service Status',
    startService: 'Start Service',
    stopService: 'Stop Service',
    restartService: 'Restart Service',
    userManagement: 'User Management',
    quotaManagement: 'Traffic & Quotas',
    configManagement: 'Configuration',
    viewLogs: 'View Logs',
    switchLanguage: 'Switch Language',
    exit: 'Exit',
    onlineUsers: 'Online Users',
    subscriptions: 'Subscriptions',
  },
  hints: {
    viewDetails: 'view details',
    liveConnections: 'live connections',
    addDeleteShare: 'add / delete / share',
    limitsUsage: 'limits & usage',
    subLinkServer: 'sub link server',
    backupRestore: 'backup / restore',
    accessError: 'access & error',
  },
  status: {
    serviceStatus: 'Service Status',
    userCount: 'User Count',
    active: 'Active',
    inactive: 'Inactive',
    unknown: 'Unknown',
    running: 'Running',
    stopped: 'Stopped',
    loading: 'Loading',
    error: 'Error',
  },
  ui: {
    navigate: 'navigate',
    select: 'select',
    search: 'search',
    quit: 'quit',
    back: 'back',
    add: 'add',
    delete_: 'delete',
    share: 'share',
    details: 'details',
    refresh: 'refresh',
    follow: 'follow',
    scroll: 'scroll',
    switchLog: 'switch log',
    setQuota: 'set quota',
    resetUsage: 'reset usage',
    reenable: 're-enable',
    start: 'start',
    stop: 'stop',
    entries: 'entries',
    users: 'users',
    noData: 'No data',
    processing: 'Processing...',
    autoRefresh: 'Auto-refresh',
    never: 'Never',
    expired: 'Expired',
    daysLeft: 'd left',
    unlimited: 'Unlimited',
    createBackup: 'Create Backup',
    existing: 'existing',
    custom: 'Custom...',
    confirmStop: 'Stop service? Active connections will be dropped.',
    confirmRestart: 'Restart service? Active connections will be dropped.',
    userCreated: 'User created',
    email: 'Email',
    uuid: 'UUID',
    expiry: 'Expiry',
    expiryDaysPrompt: 'Expiry (days, empty=never):',
    emailPrompt: 'Email:',
    selectUser: 'Select user:',
    selectQuota: 'Select quota:',
    noUsers: 'No users configured',
    noConnections: 'No active connections',
    noEntries: 'No entries',
    noQuotas: 'No quotas configured',
    pressEscBack: 'press esc to go back',
  },
  quota: {
    title: 'Traffic Quota Management',
    list: 'View Quota List',
    set: 'Set User Quota',
    show: 'View Quota Details',
    reset: 'Reset Used Traffic',
    reenable: 'Re-enable User',
    unlimited: 'Unlimited',
    used: 'Used',
    remaining: 'Remaining',
    exceeded: 'Exceeded',
    warning: 'Warning',
    normal: 'Normal',
    noQuota: 'No quota set',
    selectUser: 'Select a user',
    selectPreset: 'Select a preset quota',
    enterCustom: 'Enter custom quota',
    confirmReset: "Are you sure you want to reset this user's traffic?",
    confirmReenable: 'Are you sure you want to re-enable this user?',
    executeCheck: 'Execute Quota Check',
    checkComplete: 'Quota check complete',
    normalUsers: 'Normal users',
    warningUsers: 'Warning users',
    exceededUsers: 'Exceeded users',
    disabledUsers: 'Disabled',
  },
  logs: {
    title: 'Log Viewer',
    accessLog: 'Access Log',
    errorLog: 'Error Log',
    noLogs: 'No logs available',
    logFileNotFound: 'Log file not found',
    logFileEmpty: 'Log file is empty',
    showingLines: 'Showing last {lines} lines',
  },
  config: {
    title: 'Config Management',
    viewConfig: 'View Current Config',
    backupConfig: 'Backup Config',
    restoreConfig: 'Restore Config',
    backupSuccess: 'Config backed up to: {path}',
    restoreSuccess: 'Config restored successfully',
    noBackups: 'No backup files available',
    selectBackup: 'Select a backup to restore',
    confirmRestore: 'Are you sure you want to restore this backup?',
    restoreWarning: 'Restoring will overwrite current config and restart service',
  },
  publicIp: {
    detecting: 'Detecting public IP...',
    detected: 'Detected public IP: {ip}',
    detectionFailed: 'Failed to detect public IP automatically',
    enterManually: 'Please enter public IP address manually',
    invalidIp: 'Invalid IP address format',
    saved: 'Public IP saved',
    natDetected: 'NAT environment detected (private IP: {ip})',
  },
  actions: {
    selectAction: 'Please select an action',
    confirm: 'Confirm',
    cancel: 'Cancel',
    back: 'Back',
  },
  messages: {
    languageSwitched: 'Language switched to English',
    operationSuccess: 'Operation successful',
    operationFailed: 'Operation failed',
    thankYou: 'Thank you for using Xray Manager!',
    terminalTooNarrow: 'Terminal width is too narrow',
    terminalTooShort: 'Terminal height is too short',
    terminalResizeSuggestion: 'Please resize your terminal for optimal display',
    quotaSet: 'Quota set successfully',
    quotaReset: 'Used traffic has been reset',
    userReenabled: 'User has been re-enabled',
    noUsersWithQuota: 'No users with quota configured',
    noDisabledUsers: 'No disabled users',
  },
};

/** All translations */
const translations: Record<Language, Translations> = {
  zh: zhTranslations,
  en: enTranslations,
};

/** Current language (default: English) */
let currentLanguage: Language = 'en';

/**
 * Load language preference from file
 */
export function loadLanguagePreference(): Language {
  try {
    if (fs.existsSync(LANG_FILE)) {
      const lang = fs.readFileSync(LANG_FILE, 'utf-8').trim();
      if (lang === 'zh' || lang === 'en') {
        currentLanguage = lang;
        return lang;
      }
    }
  } catch {
    // Ignore errors, use default
  }
  return 'en'; // Default to English
}

/**
 * Save language preference to file
 */
export function saveLanguagePreference(lang: Language): void {
  try {
    fs.writeFileSync(LANG_FILE, lang, 'utf-8');
    currentLanguage = lang;
  } catch {
    // Ignore errors
  }
}

/**
 * Get current language
 */
export function getCurrentLanguage(): Language {
  return currentLanguage;
}

/**
 * Set current language
 */
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  saveLanguagePreference(lang);
}

/**
 * Toggle language (switch between zh and en)
 */
export function toggleLanguage(): Language {
  const newLang = currentLanguage === 'zh' ? 'en' : 'zh';
  setLanguage(newLang);
  return newLang;
}

/**
 * Get translations for current language
 */
export function t(): Translations {
  return translations[currentLanguage];
}

/**
 * Get translation for specific language
 */
export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

// Load language preference on module initialization
loadLanguagePreference();
