import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'WoW AI Class Helper',
    'app.description': 'AI-powered World of Warcraft class guides',
  },
  es: {
    'app.title': 'Asistente de Clases WoW IA',
    'app.description': 'Guías de clases de World of Warcraft impulsadas por IA',
  },
  fr: {
    'app.title': 'Assistant de Classe WoW IA',
    'app.description': 'Guides de classe World of Warcraft alimentés par IA',
  },
  de: {
    'app.title': 'WoW KI-Klassenassistent',
    'app.description': 'KI-gestützte World of Warcraft-Klassenleitfäden',
  },
  pt: {
    'app.title': 'Assistente de Classe WoW IA',
    'app.description': 'Guias de classe World of Warcraft alimentadas por IA',
  },
  ja: {
    'app.title': 'WoW AI クラスヘルパー',
    'app.description': 'AI搭載のWorld of Warcraftクラスガイド',
  },
  zh: {
    'app.title': 'WoW AI 职业助手',
    'app.description': 'AI驱动的魔兽世界职业指南',
  },
};

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLanguage = 'en',
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('wow_class_helper_language');
    if (stored && Object.keys(TRANSLATIONS).includes(stored)) {
      return stored as Language;
    }
    return defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem('wow_class_helper_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
