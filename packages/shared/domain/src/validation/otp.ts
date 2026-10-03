import { err, ok } from '../result';
import { normalizeDigits } from '../text/digits';
import { fieldError } from './field-error';
import type { ValidationResult } from './field-error.types';
import type { OtpCode } from './otp.types';
import { OTP_LENGTH, OTP_MESSAGES } from './otp.constants';

/** Exactly six ASCII digits; leading zero preserved; only outer whitespace is trimmed. Format ≠ correctness. */
export const parseOtpCode = (raw: string, length: number = OTP_LENGTH): ValidationResult<OtpCode> => {
  const s = normalizeDigits(raw).trim();
  if (s === '') return err(fieldError('OTP_INVALID', OTP_MESSAGES.empty));
  if (!/^[0-9]+$/.test(s)) return err(fieldError('OTP_INVALID', OTP_MESSAGES.nonDigit));
  if (s.length !== length) return err(fieldError('OTP_INVALID', OTP_MESSAGES.length));
  return ok(s as OtpCode);
};
