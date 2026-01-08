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
