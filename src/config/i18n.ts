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
  };

  // Status labels
  status: {
    serviceStatus: string;
    userCount: string;
    active: string;
    inactive: string;
    unknown: string;
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
    viewStatus: '查看服务状态',
    startService: '启动服务',
    stopService: '停止服务',
    restartService: '重启服务',
    userManagement: '用户管理',
    quotaManagement: '流量配额管理',
    configManagement: '配置管理',
    viewLogs: '查看日志',
    switchLanguage: '切换语言 (Switch to English)',
    exit: '退出',
  },
  status: {
    serviceStatus: '服务状态',
    userCount: '用户数',
    active: '运行中',
    inactive: '已停止',
    unknown: '未知',
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
    viewStatus: 'View Service Status',
    startService: 'Start Service',
    stopService: 'Stop Service',
    restartService: 'Restart Service',
    userManagement: 'User Management',
    quotaManagement: 'Traffic Quota Management',
    configManagement: 'Config Management',
    viewLogs: 'View Logs',
    switchLanguage: 'Switch Language (切换为中文)',
    exit: 'Exit',
  },
  status: {
    serviceStatus: 'Service Status',
    userCount: 'User Count',
    active: 'Active',
    inactive: 'Inactive',
    unknown: 'Unknown',
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
    confirmReset: 'Are you sure you want to reset this user\'s traffic?',
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

/** Current language (default: Chinese) */
let currentLanguage: Language = 'zh';

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
  return 'zh'; // Default to Chinese
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
