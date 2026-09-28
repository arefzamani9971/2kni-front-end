import { normalizeDigits } from '@dukani/domain';

/** Accepts Persian digits, «٫» or «.» as decimal point, and ignores thousands separators. */
export const toCanonicalDecimal = (raw: string): string =>
  normalizeDigits(raw).replace(/[٬,،\s]/g, '').replace(/٫/g, '.');
