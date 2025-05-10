
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Function to safely load translation files, with proper error handling
const safeImport = async (path: string) => {
  try {
    const module = await import(path);
    return module.default;
  } catch (error) {
    console.warn(`Failed to load translation file: ${path}`, error);
    return {};
  }
};

// Dynamic loading of translation files
const loadLocaleFiles = async (language: string) => {
  return {
    auth: await safeImport(`./locales/${language}/auth.json`),
    common: await safeImport(`./locales/${language}/common.json`),
    dashboard: await safeImport(`./locales/${language}/dashboard.json`),
    ideas: await safeImport(`./locales/${language}/ideas.json`),
    credits: await safeImport(`./locales/${language}/credits.json`),
    ideaForm: await safeImport(`./locales/${language}/ideaForm.json`),
    settings: await safeImport(`./locales/${language}/settings.json`),
    profile: await safeImport(`./locales/${language}/profile.json`).catch(() => ({})),
    metrics: await safeImport(`./locales/${language}/metrics.json`).catch(() => ({})),
    content: await safeImport(`./locales/${language}/content.json`).catch(() => ({})),
    landing: await safeImport(`./locales/${language}/landing.json`).catch(() => ({}))
  };
};

// Function to load resources with better error handling
const loadResources = async () => {
  const languages = ['en', 'pt', 'es', 'ja'];
  const resources: Record<string, Record<string, any>> = {};

  for (const lang of languages) {
    try {
      const namespaces = await loadLocaleFiles(lang);
      resources[lang] = namespaces;
    } catch (error) {
      console.error(`Failed to load translations for ${lang}`, error);
      resources[lang] = {}; // Provide empty fallback
    }
  }

  return resources;
};

// Initialize i18next
const initializeI18n = async () => {
  const resources = await loadResources();

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: ['en', 'pt'], // Fallback chain: first English, then Portuguese
      defaultNS: 'common',
      fallbackNS: 'common',
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
      returnObjects: true,
      debug: false // Set to true for detailed debugging information
    });

  return i18n;
};

// Export the initialization function
export const i18nInstance = initializeI18n();

// Export i18n for use in the rest of the application
export default i18n;
