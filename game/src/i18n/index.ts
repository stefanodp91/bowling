import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

/**
 * Every visible string comes from here (AGENTS.md; wiki/game/hud.md, rule 7). Another language is
 * another file in locales/ and one more entry below.
 */
export const DEFAULT_LANGUAGE = 'en';

export function initI18n(): typeof i18next {
  void i18next.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return i18next;
}
