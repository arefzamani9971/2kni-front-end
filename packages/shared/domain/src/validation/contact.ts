import { err, ok } from '../result';
import { compactDigits } from '../text/digits';
import { fieldError } from './field-error';
import type { ValidationResult } from './field-error.types';
import { CONTACT_MESSAGES } from './contact.constants';

/** Iranian postal code: exactly 10 digits (backend `BankFormats.IsValidPostalCode`). */
export const parsePostalCode = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  return /^[0-9]{10}$/.test(s)
    ? ok(s)
    : err(fieldError('POSTAL_CODE_INVALID', CONTACT_MESSAGES.postalCode, 'postalCode'));
};

/** Iranian landline with area code: `0` + area + number = 11 digits, not a mobile. */
export const parseLandline = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  return /^0[1-8][0-9]{9}$/.test(s)
    ? ok(s)
    : err(fieldError('PHONE_INVALID', CONTACT_MESSAGES.landline, 'landline'));
};

/** Public store phone (F02 §6): 5..20 digits after removing spaces/dashes — landline, mobile or short number. */
export const parseStorePhone = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  return /^[0-9]{5,20}$/.test(s)
    ? ok(s)
    : err(fieldError('PHONE_INVALID', CONTACT_MESSAGES.storePhone, 'storePhone'));
};

export const parseEmail = (raw: string): ValidationResult => {
  const s = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)
    ? ok(s.toLowerCase())
    : err(fieldError('EMAIL_INVALID', CONTACT_MESSAGES.email, 'email'));
};
