import type { AuthLayout } from '@dukani/ui-kit';

type AuthCopy = {
  readonly loginTitle: string;
  /** `cards` only: heading of the mobile-number card. */
  readonly loginCard?: string;
  readonly loginLead: string;
  /** Help line under the field (seller only; the customer frames have none). */
  readonly loginNote?: readonly string[];
  /** Whether the login screen has an App Bar back (seller frames do; customer frames do not). */
  readonly loginBack: boolean;
  readonly otpTitle: string;
  readonly otpCard?: string;
  readonly otpLead: (mobile: string) => string;
  readonly changeNumber: string;
  /** `cards`: «بازگشت» next to «تأیید و ورود» (Figma 310:396 / 310:34). */
  readonly otpBack: boolean;
};

/** Texts of the sign-in screens per product layout, exactly as in the Figma frames. */
export const AUTH_COPY: Readonly<Record<AuthLayout, AuthCopy>> = {
  // Seller — Figma 17/16: AUTH-01 358:478 / 358:5341, AUTH-02 358:479 / 358:5342
  split: {
    loginTitle: 'ورود به دکانی',
    loginLead: 'فروش، موجودی و حساب مشتریان فروشگاه شما',
    loginNote: ['کد ورود به همین شماره پیامک می‌شود.', 'با ادامه، شرایط استفاده و حریم خصوصی را می‌پذیرید.'],
    loginBack: true,
    otpTitle: 'تأیید شماره موبایل',
    otpLead: (m) => `کد به ${m} ارسال شد.`,
    changeNumber: 'تغییر شماره',
    otpBack: false,
  },
  // Customer — Figma 20b/20: AUTH-01 310:379 / 310:3, AUTH-02 310:396 / 310:34 (rendered texts; some layer names are stale)
  cards: {
    loginTitle: 'ورود به حساب مشتری',
    loginCard: 'شمارهٔ همراه شما',
    loginLead: 'کد ورود به همین شماره پیامک می‌شود.',
    loginBack: false,
    otpTitle: 'تأیید شماره همراه',
    otpCard: 'کد ورود',
    otpLead: (m) => `شماره: ${m}`,
    changeNumber: 'اصلاح شماره',
    otpBack: true,
  },
};

/** Context line of the customer header when no store context is known (Figma shows «دکانی · <store>»). */
export const CUSTOMER_CONTEXT = 'دکانی';

export const SELLER_AUTH_BRAND = {
  name: 'دکانی',
  workspace: 'پنل فروشنده',
  description: AUTH_COPY.split.loginLead,
} as const;
