import { appError, OTP_LENGTH, toPersianDigits, type AppError } from '@dukani/domain';
import type { OtpChallenge, OtpProblem } from './otp-challenge.types';

export const secondsUntil = (iso: string, now: number = Date.now()): number =>
  Math.max(0, Math.ceil((Date.parse(iso) - now) / 1000));

/** 60 → «۰۱:۰۰» */
export const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return toPersianDigits(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
};

export const otpProblemOf = (e: AppError): OtpProblem => {
  switch (e.code) {
    case 'OTP_WRONG':
      return 'wrong';
    case 'OTP_EXPIRED':
      return 'expired';
    case 'OTP_RATE_LIMITED':
      return 'limited';
    case 'OTP_SEND_FAILED':
      return 'send-failed';
    case 'USER_BLOCKED':
      return 'blocked';
    default:
      return 'other';
  }
};

/** When the server accepts a retry (`retryAfterSeconds` of a rate-limited error); null = no wait given. */
export const retryDeadline = (e: AppError, now: number = Date.now()): number | null =>
  e.retryAfterSeconds && e.retryAfterSeconds > 0 ? now + e.retryAfterSeconds * 1000 : null;

/** otp-limited (Figma 394:6076): «… تا ۰۱:۰۰ دیگر دوباره تلاش کنید.» from the server wait, never an estimate. */
export const limitedMessage = (secondsLeft: number): string =>
  secondsLeft > 0
    ? `درخواست‌های زیادی فرستاده‌اید. تا ${formatCountdown(secondsLeft)} دیگر دوباره تلاش کنید.`
    : 'اکنون می‌توانید دوباره کد بگیرید.';

/** The OTP screen only knows the 6-digit contract; another length is a recoverable error, never a truncation (F01 §5). */
export const assertSupportedChallenge = (c: OtpChallenge): OtpChallenge => {
  if (c.codeLength !== OTP_LENGTH)
    throw appError('Server', 'OTP_CODE_LENGTH_UNSUPPORTED', 'ورود فعلاً ممکن نیست؛ کمی بعد دوباره تلاش کنید.');
  return c;
};
