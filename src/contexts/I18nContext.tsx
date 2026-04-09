import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  type Language,
  type Translations,
  t as getTranslations,
  setLanguage as setLangPersist,
  getCurrentLanguage,
  loadLanguagePreference,
} from '../config/i18n.js';

interface I18nContextValue {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  t: getTranslations(),
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export function I18nProvider({
  children,
  defaultLanguage = 'en',
}: {
  children: React.ReactNode;
  defaultLanguage?: Language;
}) {
  // Load from preference file, fallback to default
  const initial = loadLanguagePreference() || defaultLanguage;
  const [language, setLanguageState] = useState<Language>(initial);

  const setLanguage = useCallback((lang: Language) => {
    setLangPersist(lang);
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
  }, [language, setLanguage]);

  // Update module-level language so t() returns correct translations
  if (getCurrentLanguage() !== language) {
    setLangPersist(language);
  }

  return (
    <I18nContext.Provider value={{ language, t: getTranslations(), setLanguage, toggleLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
