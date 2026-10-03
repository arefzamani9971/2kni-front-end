import { toPersianDigits, type AppError } from '@dukani/domain';
import type { OtpProblem } from './otp-challenge.types';

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
