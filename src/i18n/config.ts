
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Carregamento dinâmico dos arquivos de tradução
const loadLocaleFiles = (language: string) => {
  return {
    auth: import(`./locales/${language}/auth.json`).then(m => m.default),
    common: import(`./locales/${language}/common.json`).then(m => m.default),
    dashboard: import(`./locales/${language}/dashboard.json`).then(m => m.default),
    ideas: import(`./locales/${language}/ideas.json`).then(m => m.default),
    credits: import(`./locales/${language}/credits.json`).then(m => m.default),
    ideaForm: import(`./locales/${language}/ideaForm.json`).then(m => m.default),
    settings: import(`./locales/${language}/settings.json`).then(m => m.default),
    profile: import(`./locales/${language}/profile.json`).catch(() => ({})),
    metrics: import(`./locales/${language}/metrics.json`).catch(() => ({})),
    content: import(`./locales/${language}/content.json`).catch(() => ({})),
    landing: import(`./locales/${language}/landing.json`).catch(() => ({}))
  };
};

// Função para carregar recursos de tradução
const loadResources = async () => {
  const languages = ['en', 'pt', 'es', 'ja'];
  const resources: Record<string, Record<string, any>> = {};

  for (const lang of languages) {
    const namespaces = await loadLocaleFiles(lang);
    resources[lang] = {};

    for (const [ns, promise] of Object.entries(namespaces)) {
      try {
        const module = await promise;
        resources[lang][ns] = module;
      } catch (error) {
        console.warn(`Failed to load ${ns} namespace for ${lang}`, error);
        resources[lang][ns] = {};
      }
    }
  }

  return resources;
};

// Inicializa o i18next
const initializeI18n = async () => {
  const resources = await loadResources();

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'pt',
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
      returnObjects: true
    });

  return i18n;
};

// Exporta a função de inicialização
export const i18nInstance = initializeI18n();

// Exporta o i18n para uso no resto da aplicação
export default i18n;
