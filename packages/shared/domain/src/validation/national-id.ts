import { err, ok } from '../result';
import { compactDigits } from '../text/digits';
import { fieldError, type ValidationResult } from './field-error';

export const NATIONAL_ID_MESSAGES = {
  empty: 'کد ملی را وارد کنید.',
  format: 'کد ملی باید ۱۰ رقم باشد.',
  checksum: 'کد ملی معتبر نیست.',
  legalFormat: 'شناسه ملی باید ۱۱ رقم باشد.',
  legalChecksum: 'شناسه ملی معتبر نیست.',
} as const;

/** Iranian personal national id (کد ملی): 10 digits with the official check digit (same as backend). */
export const isValidNationalId = (raw: string): boolean => {
  const s = compactDigits(raw);
  if (!/^[0-9]{10}$/.test(s) || new Set(s).size === 1) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(s[i]) * (10 - i);
  const r = sum % 11;
  const check = Number(s[9]);
  return r < 2 ? check === r : check === 11 - r;
};

export const parseNationalId = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  if (s === '') return err(fieldError('NATIONAL_ID_INVALID', NATIONAL_ID_MESSAGES.empty));
  if (!/^[0-9]{10}$/.test(s)) return err(fieldError('NATIONAL_ID_INVALID', NATIONAL_ID_MESSAGES.format));
  if (!isValidNationalId(s)) return err(fieldError('NATIONAL_ID_INVALID', NATIONAL_ID_MESSAGES.checksum));
  return ok(s);
};

const LEGAL_COEFFICIENTS = [29, 27, 23, 19, 17, 29, 27, 23, 19, 17] as const;

/** Iranian legal-entity national id (شناسه ملی اشخاص حقوقی): 11 digits with its check digit. */
export const isValidLegalNationalId = (raw: string): boolean => {
  const s = compactDigits(raw);
  if (!/^[0-9]{11}$/.test(s) || new Set(s).size === 1) return false;
  const shift = Number(s[9]) + 2;
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += (Number(s[i]) + shift) * LEGAL_COEFFICIENTS[i]!;
  let r = sum % 11;
  if (r === 10) r = 0;
  return r === Number(s[10]);
};

export const parseLegalNationalId = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  if (!/^[0-9]{11}$/.test(s)) return err(fieldError('LEGAL_ID_INVALID', NATIONAL_ID_MESSAGES.legalFormat));
  if (!isValidLegalNationalId(s)) return err(fieldError('LEGAL_ID_INVALID', NATIONAL_ID_MESSAGES.legalChecksum));
  return ok(s);
};
