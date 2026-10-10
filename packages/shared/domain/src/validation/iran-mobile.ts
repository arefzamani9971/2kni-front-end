import { err, ok } from '../result';
import { normalizeDigits } from '../text/digits';
import { fieldError } from './field-error';
import type { ValidationResult } from './field-error.types';
import type { IranMobile } from './iran-mobile.types';

/**
 * Iranian mobile in local form `09xxxxxxxxx` (ui-guidelines 2.4.1, backend `IranMobile`).
 * Persian/Arabic digits are normalized; `+98` / `0098` prefixes and spaces/dashes are accepted;
 * letters are rejected, never stripped.
 */
export const parseIranMobile = (raw: string): ValidationResult<IranMobile> => {
  let s = normalizeDigits(raw).trim().replace(/[\s-]/g, '');
  if (s === '') return err(fieldError('MOBILE_INVALID', 'empty'));
  if (s.startsWith('+98')) s = `0${s.slice(3)}`;
  else if (s.startsWith('0098')) s = `0${s.slice(4)}`;
  if (!/^[0-9]+$/.test(s)) return err(fieldError('MOBILE_INVALID', 'nonDigit'));
  if (!/^09[0-9]{9}$/.test(s)) return err(fieldError('MOBILE_INVALID', 'format'));
  return ok(s as IranMobile);
};

/** `0912 345 6789` style grouping for display. */
export const formatIranMobile = (mobile: string): string =>
  mobile.length === 11 ? `${mobile.slice(0, 4)} ${mobile.slice(4, 7)} ${mobile.slice(7)}` : mobile;
