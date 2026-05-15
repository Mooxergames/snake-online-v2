export const locales = [
  'en', 'es', 'pt', 'de', 'fr', 'it', 'tr', 'ru',
  'ar', 'zh', 'ja', 'ko', 'hi', 'id',
] as const;

export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeMeta: Record<Locale, { name: string; native: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English',     native: 'English',    flag: '🇺🇸', dir: 'ltr' },
  es: { name: 'Spanish',     native: 'Español',    flag: '🇪🇸', dir: 'ltr' },
  pt: { name: 'Portuguese',  native: 'Português',  flag: '🇧🇷', dir: 'ltr' },
  de: { name: 'German',      native: 'Deutsch',    flag: '🇩🇪', dir: 'ltr' },
  fr: { name: 'French',      native: 'Français',   flag: '🇫🇷', dir: 'ltr' },
  it: { name: 'Italian',     native: 'Italiano',   flag: '🇮🇹', dir: 'ltr' },
  tr: { name: 'Turkish',     native: 'Türkçe',     flag: '🇹🇷', dir: 'ltr' },
  ru: { name: 'Russian',     native: 'Русский',    flag: '🇷🇺', dir: 'ltr' },
  ar: { name: 'Arabic',      native: 'العربية',    flag: '🇸🇦', dir: 'rtl' },
  zh: { name: 'Chinese',     native: '中文',        flag: '🇨🇳', dir: 'ltr' },
  ja: { name: 'Japanese',    native: '日本語',       flag: '🇯🇵', dir: 'ltr' },
  ko: { name: 'Korean',      native: '한국어',       flag: '🇰🇷', dir: 'ltr' },
  hi: { name: 'Hindi',       native: 'हिन्दी',      flag: '🇮🇳', dir: 'ltr' },
  id: { name: 'Indonesian',  native: 'Indonesia',  flag: '🇮🇩', dir: 'ltr' },
};
