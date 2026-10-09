import { err, ok } from '../result';
import { compactDigits } from '../text/digits';
import { fieldError } from './field-error';
import type { ValidationResult } from './field-error.types';
import { BANK_MESSAGES } from './bank.constants';

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

/** All digits the same (`0000…`, `5555…`): placeholders that may even pass Luhn (F02 §7). */
const isUniform = (s: string) => /^(\d)\1*$/.test(s);

/** 16-digit Iranian bank card with a Luhn check digit (backend `StoreRules.IsCardNumber`). */
export const isValidCardNumber = (raw: string): boolean => {
  const s = compactDigits(raw);
  return /^[0-9]{16}$/.test(s) && !isUniform(s) && passesLuhn(s);
};

export const parseCardNumber = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  if (!/^[0-9]{16}$/.test(s)) return err(fieldError('CARD_INVALID', BANK_MESSAGES.cardFormat, 'cardFormat'));
  if (isUniform(s) || !passesLuhn(s))
    return err(fieldError('CARD_INVALID', BANK_MESSAGES.cardChecksum, 'cardChecksum'));
  return ok(s);
};

/** Bank account number: 1..34 digits after removing spaces/dashes; a string, so leading zeros stay (F02 §7). */
export const parseAccountNumber = (raw: string): ValidationResult => {
  const s = compactDigits(raw);
  return /^[0-9]{1,34}$/.test(s)
    ? ok(s)
    : err(fieldError('ACCOUNT_NUMBER_INVALID', BANK_MESSAGES.accountNumber, 'accountNumber'));
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
  if (!/^IR[0-9]{24}$/.test(s))
    return err(fieldError('SHEBA_INVALID', BANK_MESSAGES.shebaFormat, 'shebaFormat'));
  if (!isValidSheba(s)) return err(fieldError('SHEBA_INVALID', BANK_MESSAGES.shebaChecksum, 'shebaChecksum'));
  return ok(s);
};

/** `IR06 0120 …` grouping for display. */
export const formatSheba = (sheba: string): string => sheba.replace(/(.{4})(?=.)/g, '$1 ');
