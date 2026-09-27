import { toPersianDigits, type AppError } from '@dukani/domain';

/** An OTP sent to a mobile (from `OtpRequestedDto`), kept for the OTP screen and resend. */
export type OtpChallenge = {
  readonly requestId: string;
  /** The number the user typed (ASCII), shown in full like Figma AUTH-02. */
  readonly mobile: string;
  readonly mobileMasked: string;
  readonly expiresAt: string;
  readonly resendAvailableAt: string;
  readonly codeLength: number;
  /** Development/mock only: the code itself (backend `ExposeCodeInDevelopment`). */
  readonly devCode?: string | null;
};

export const secondsUntil = (iso: string, now: number = Date.now()): number => Math.max(0, Math.ceil((Date.parse(iso) - now) / 1000));

/** 60 → «۰۱:۰۰» */
export const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return toPersianDigits(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
};

/** OTP screen states of Figma page 17 (otp-wrong, otp-expired, otp-limited, otp-send-failed) plus blocked. */
export type OtpProblem = 'wrong' | 'expired' | 'limited' | 'send-failed' | 'blocked' | 'other';

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

/** Title and description of each problem state (Figma «Alert / Danger» + App Bar title). */
export const OTP_PROBLEM_COPY: Record<Exclude<OtpProblem, 'other'>, { title: string; description: string }> = {
  wrong: { title: 'کد ورود درست نیست', description: 'کد واردشده درست نیست. دوباره آن را وارد کنید.' },
  expired: { title: 'مهلت کد تمام شد', description: 'برای ادامه، کد تازه‌ای درخواست کنید.' },
  limited: { title: 'کمی صبر کنید', description: 'درخواست‌های زیادی فرستاده‌اید. کمی بعد دوباره تلاش کنید.' },
  'send-failed': { title: 'کد ارسال نشد', description: 'ارسال پیامک انجام نشد. دوباره تلاش کنید یا شماره را اصلاح کنید.' },
  blocked: { title: 'حساب مسدود است', description: 'حساب کاربری شما مسدود است؛ برای پیگیری با پشتیبانی تماس بگیرید.' },
};
