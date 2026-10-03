import type { OtpProblem } from './otp-challenge.types';

/** Title and description of each problem state (Figma «Alert / Danger» + App Bar title). */
export const OTP_PROBLEM_COPY: Record<
  Exclude<OtpProblem, 'other'>,
  { title: string; description: string }
> = {
  wrong: { title: 'کد ورود درست نیست', description: 'کد واردشده درست نیست. دوباره آن را وارد کنید.' },
  expired: { title: 'مهلت کد تمام شد', description: 'برای ادامه، کد تازه‌ای درخواست کنید.' },
  limited: { title: 'کمی صبر کنید', description: 'درخواست‌های زیادی فرستاده‌اید. کمی بعد دوباره تلاش کنید.' },
  'send-failed': {
    title: 'کد ارسال نشد',
    description: 'ارسال پیامک انجام نشد. دوباره تلاش کنید یا شماره را اصلاح کنید.',
  },
  blocked: {
    title: 'حساب مسدود است',
    description: 'حساب کاربری شما مسدود است؛ برای پیگیری با پشتیبانی تماس بگیرید.',
  },
};
