const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits → ASCII. Other characters are kept as they are. */
export const normalizeDigits = (input: string): string =>
  input
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));

/** ASCII digits → Persian digits (display only; payloads always use ASCII). */
export const toPersianDigits = (input: string | number): string =>
  String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);

/** Normalized digits with spaces, dashes and ZWNJ removed (card, sheba, national id, postal code). */
export const compactDigits = (raw: string): string => normalizeDigits(raw).trim().replace(/[\s\-‌]/g, '');

export const isAsciiDigits = (s: string): boolean => /^[0-9]+$/.test(s);
