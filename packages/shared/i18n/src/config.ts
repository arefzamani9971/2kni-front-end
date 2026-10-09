import type { Locale } from './types';
export const DEFAULT_LOCALE: Locale = 'fa';
export const SUPPORTED_LOCALES = ['fa', 'en'] as const;
export const TIME_ZONE = 'Asia/Tehran';
/** Unknown user input never becomes a dynamic import path. */
export function resolveLocale(value: unknown): Locale {
  return value === 'en' ? 'en' : DEFAULT_LOCALE;
}
export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'fa' ? 'rtl' : 'ltr';
}
