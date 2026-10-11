import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arTranslation from './locales/ar.json';
import enTranslation from './locales/en.json';

const getInitialLang = (): string => {
  if (typeof window === 'undefined') return 'ar';
  try {
    const saved = localStorage.getItem('i18nextLng');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch (_e) {}
  return 'ar';
};

const initialLang = getInitialLang();

if (typeof document !== 'undefined') {
  document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = initialLang;
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: arTranslation },
    en: { translation: enTranslation },
  },
  lng: initialLang,
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    try {
      localStorage.setItem('i18nextLng', lng);
    } catch (_e) {}
  }
});

export default i18n;
