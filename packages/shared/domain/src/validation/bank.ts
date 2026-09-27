import { err, ok } from '../result';
import { compactDigits } from '../text/digits';
import { fieldError, type ValidationResult } from './field-error';

export const BANK_MESSAGES = {
  cardFormat: 'شماره کارت باید ۱۶ رقم باشد.',
  cardChecksum: 'شماره کارت معتبر نیست.',
  shebaFormat: 'شماره شبا باید IR و ۲۴ رقم باشد.',
  shebaChecksum: 'شماره شبا معتبر نیست.',
} as const;

/** Luhn check digit over ASCII digits. */
export const passesLuhn = (digits: string): boolean => {
  if (!/^[0-9]+$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
};

/** 16-digit Iranian bank card with a Luhn check digit (backend `BankFormats.IsValidCardNumber`). */
export const isValidCardNumber = (raw: string): boolean => {
  const s = compactDigits(raw);
  return /^[0-9]{16}$/.test(s) && passesLuhn(s);
};

export const parseCardNumber = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  if (!/^[0-9]{16}$/.test(s)) return err(fieldError('CARD_INVALID', BANK_MESSAGES.cardFormat));
  if (!passesLuhn(s)) return err(fieldError('CARD_INVALID', BANK_MESSAGES.cardChecksum));
  return ok(s);
};

/** `6037 9917 1234 5678` grouping for display. */
export const formatCardNumber = (digits: string): string => digits.replace(/(\d{4})(?=\d)/g, '$1 ');

/** "IR" + 24 digits (upper case); 24 bare digits get the "IR" prefix (backend `NormalizeSheba`). */
export const normalizeSheba = (raw: string): string => {
  const s = compactDigits(raw).toUpperCase();
  return /^[0-9]{24}$/.test(s) ? `IR${s}` : s;
};

/** ISO 13616 mod-97 check of an Iranian IBAN (شبا). */
export const isValidSheba = (raw: string): boolean => {
  const s = normalizeSheba(raw);
  if (!/^IR[0-9]{24}$/.test(s)) return false;
  const rearranged = `${s.slice(4)}1827${s.slice(2, 4)}`; // I=18, R=27
  let remainder = 0;
  for (const ch of rearranged) remainder = (remainder * 10 + Number(ch)) % 97;
  return remainder === 1;
};

export const parseSheba = (raw: string): ValidationResult => {
  const s = normalizeSheba(raw);
  if (!/^IR[0-9]{24}$/.test(s)) return err(fieldError('SHEBA_INVALID', BANK_MESSAGES.shebaFormat));
  if (!isValidSheba(s)) return err(fieldError('SHEBA_INVALID', BANK_MESSAGES.shebaChecksum));
  return ok(s);
};

/** `IR06 0120 …` grouping for display. */
export const formatSheba = (sheba: string): string => sheba.replace(/(.{4})(?=.)/g, '$1 ');
