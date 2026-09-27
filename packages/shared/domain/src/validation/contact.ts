import { err, ok } from '../result';
import { compactDigits } from '../text/digits';
import { fieldError, type ValidationResult } from './field-error';

export const CONTACT_MESSAGES = {
  postalCode: 'کد پستی باید ۱۰ رقم باشد.',
  landline: 'شماره تلفن ثابت باید ۱۱ رقم و با پیش‌شماره باشد (مثل ۰۲۱۱۲۳۴۵۶۷۸).',
  email: 'نشانی ایمیل معتبر نیست.',
} as const;

/** Iranian postal code: exactly 10 digits (backend `BankFormats.IsValidPostalCode`). */
export const parsePostalCode = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  return /^[0-9]{10}$/.test(s) ? ok(s) : err(fieldError('POSTAL_CODE_INVALID', CONTACT_MESSAGES.postalCode));
};

/** Iranian landline with area code: `0` + area + number = 11 digits, not a mobile. */
export const parseLandline = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  return /^0[1-8][0-9]{9}$/.test(s) ? ok(s) : err(fieldError('PHONE_INVALID', CONTACT_MESSAGES.landline));
};

export const parseEmail = (raw: string): ValidationResult => {
  const s = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? ok(s.toLowerCase()) : err(fieldError('EMAIL_INVALID', CONTACT_MESSAGES.email));
};
