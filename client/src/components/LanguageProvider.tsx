import { useState, ReactNode } from 'react';
import { LanguageContext, Language } from '@/hooks/use-language';
import { t, tArray } from '@/i18n/translations';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('ua');

  const translate = (key: string) => {
    return t(key, language);
  };

  const translateArray = (key: string) => {
    return tArray(key, language);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        t: translate,
        tArray: translateArray
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}