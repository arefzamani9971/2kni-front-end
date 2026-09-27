import type { Brand } from '../brand';
import { err, ok } from '../result';
import { normalizeDigits } from '../text/digits';
import { fieldError, type ValidationResult } from './field-error';

export type OtpCode = Brand<string, 'OtpCode'>;

export const OTP_LENGTH = 6;

export const OTP_MESSAGES = {
  empty: 'کد ورود را وارد کنید.',
  nonDigit: 'فقط رقم وارد کنید.',
  length: 'کد ورود باید دقیقاً ۶ رقم باشد.',
  wrong: 'کد واردشده درست نیست. دوباره تلاش کنید.',
} as const;

/** Exactly six ASCII digits; leading zero preserved; only outer whitespace is trimmed. Format ≠ correctness. */
export const parseOtpCode = (raw: string, length: number = OTP_LENGTH): ValidationResult<OtpCode> => {
  const s = normalizeDigits(raw).trim();
  if (s === '') return err(fieldError('OTP_INVALID', OTP_MESSAGES.empty));
  if (!/^[0-9]+$/.test(s)) return err(fieldError('OTP_INVALID', OTP_MESSAGES.nonDigit));
  if (s.length !== length) return err(fieldError('OTP_INVALID', OTP_MESSAGES.length));
  return ok(s as OtpCode);
};
