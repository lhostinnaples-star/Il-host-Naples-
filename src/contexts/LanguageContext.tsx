import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
};

export const languages: Language[] = [
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', flag: 'gb' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', flag: 'us' },
  { code: 'es', name: 'Español', nativeName: 'Español', flag: 'es' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: 'fr' },
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: 'de' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: 'it' },
  { code: 'nl', name: 'Nederlands', nativeName: 'Nederlands', flag: 'nl' },
  { code: 'pt', name: 'Português', nativeName: 'Português', flag: 'pt' },
  { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', flag: 'tr' },
  { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: 'ru' },
  { code: 'zh', name: '简体中文', nativeName: '简体中文', flag: 'cn' },
  { code: 'ja', name: '日本語', nativeName: '日本語', flag: 'jp' },
  { code: 'ko', name: '한국어', nativeName: '한국어', flag: 'kr' },
  { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: 'sa' },
  { code: 'bn', name: 'বাংলা', nativeName: 'বাংলা', flag: 'bd' },
];

export const suggestedLanguages = ['en-GB', 'it', 'es', 'fr', 'de'];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  const setLanguage = React.useCallback((code: string) => {
    const lang = languages.find(l => l.code === code);
    if (lang) {
      setCurrentLanguage(lang);
    }
  }, []);

  const value = React.useMemo(() => ({ 
    currentLanguage, 
    setLanguage 
  }), [currentLanguage, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
