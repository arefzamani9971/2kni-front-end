import { normalizeDigits } from './digits';

/** Arabic Yeh/Kaf → Persian (ي→ی، ك→ک). */
export const normalizePersianLetters = (input: string): string => input.replace(/ي/g, 'ی').replace(/ك/g, 'ک');

export const collapseSpaces = (input: string): string => input.replace(/\s+/g, ' ').trim();

/**
 * Same normalization as the backend `PersianText.NormalizeTitle`: digits, Yeh/Kaf, ZWNJ → space,
 * lower case and collapsed spaces. Used for duplicate-title hints before the server check.
 */
export const normalizeTitle = (input: string): string =>
  collapseSpaces(normalizePersianLetters(normalizeDigits(input)).replace(/‌/g, ' ').toLowerCase());
