import type { Brand } from '../brand';
import { err, ok } from '../result';
import { normalizeDigits } from '../text/digits';
import { fieldError, type ValidationResult } from './field-error';

export type Barcode = Brand<string, 'Barcode'>;

export const BARCODE_MESSAGES = {
  format: 'بارکد نامعتبر است.',
  checkDigit: 'رقم کنترل بارکد درست نیست.',
} as const;

export const isGs1CheckDigitValid = (digits: string): boolean => {
  const body = digits.slice(0, -1);
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const d = Number(body[body.length - 1 - i]);
    sum += i % 2 === 0 ? d * 3 : d;
  }
  return (10 - (sum % 10)) % 10 === Number(digits.at(-1));
};

/**
 * Barcode kept as a string (leading zeros preserved), 4–32 chars without spaces; GS1 lengths
 * (8, 12, 13, 14 digits) are check-digit validated — same rule as backend `Barcode.Parse`.
 * A barcode is only one way to find an item; it is never required (BIZ-SRV-03).
 */
export const parseBarcode = (raw: string): ValidationResult<Barcode> => {
  const s = normalizeDigits(raw).trim();
  if (s.length < 4 || s.length > 32 || /\s/.test(s)) return err(fieldError('BARCODE_INVALID', BARCODE_MESSAGES.format));
  if (/^[0-9]+$/.test(s) && [8, 12, 13, 14].includes(s.length) && !isGs1CheckDigitValid(s)) {
    return err(fieldError('BARCODE_INVALID', BARCODE_MESSAGES.checkDigit));
  }
  return ok(s as Barcode);
};
