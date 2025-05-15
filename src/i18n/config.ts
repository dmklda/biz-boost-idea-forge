
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import ja from './locales/ja.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
      ja: { translation: ja }
    },
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    react: {
      useSuspense: false
    },
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
    parseMissingKeyHandler: (key) => {
      console.warn(`Missing translation key: ${key}`);
      return key.split('.').pop() || key;
    }
  });

// Export the current language for use in other files
export const getCurrentLanguage = () => {
  // Always return only the base language code (pt, en, es, ja)
  // This ensures consistent language codes are used for analysis
  const fullLanguage = i18n.language || 'pt';
  const baseLanguage = fullLanguage.split('-')[0]; // Handle codes like 'pt-BR'
  
  // Ensure we only return supported languages
  const supportedLanguages = ['pt', 'en', 'es', 'ja'];
  return supportedLanguages.includes(baseLanguage) ? baseLanguage : 'pt';
};

export default i18n;
