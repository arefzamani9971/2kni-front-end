import { normalizeDigits } from '@dukani/domain';

/** Converts pasted `+98 912 345 6789` / `0098…` and spaces/dashes to `09…` BEFORE the digit filter. */
export const normalizeMobileInput = (raw: string): string => {
  let s = normalizeDigits(raw).replace(/[\s-]/g, '');
  if (s.startsWith('+98')) s = `0${s.slice(3)}`;
  else if (s.startsWith('0098')) s = `0${s.slice(4)}`;
  return s;
};
