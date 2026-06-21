import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

function getSavedLang() {
  try {
    return localStorage.getItem('pm_lang') || 'ar';
  } catch (e) {
    return 'ar';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getSavedLang);

  useEffect(() => {
    const dir = translations[lang].dir;
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.body.style.direction = dir;
    try {
      localStorage.setItem('pm_lang', lang);
    } catch (e) {
      // localStorage قد يفشل في بعض البيئات (وضع التصفح الخاص)، نتجاهل بأمان
    }
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === 'ar' ? 'en' : 'ar'));

  const value = {
    lang,
    setLang,
    toggleLang,
    t: translations[lang],
    dir: translations[lang].dir,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
