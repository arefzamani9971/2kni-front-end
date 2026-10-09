import type { AuthTranslator } from '../i18n/types';
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
export const createAuthCopy = (t: AuthTranslator): Readonly<Record<AuthLayout, AuthCopy>> => ({
  // Seller — Figma 17/16: AUTH-01 358:478 / 358:5341, AUTH-02 358:479 / 358:5342
  split: {
    loginTitle: t('loginTitle'),
    loginLead: t('loginLead'),
    loginNote: [t('smsNote'), t('terms')],
    loginBack: true,
    otpTitle: t('otpTitle'),
    otpLead: (m) => t('sentTo', { mobile: m }),
    changeNumber: t('changeNumber'),
    otpBack: false,
  },
  // Customer — Figma 20b/20: AUTH-01 310:379 / 310:3, AUTH-02 310:396 / 310:34 (rendered texts; some layer names are stale)
  cards: {
    loginTitle: t('customerLogin'),
    loginCard: t('mobileCard'),
    loginLead: t('smsNote'),
    loginBack: false,
    otpTitle: t('customerOtpTitle'),
    otpCard: t('otpCard'),
    otpLead: (m) => t('number', { mobile: m }),
    changeNumber: t('correctNumber'),
    otpBack: true,
  },
});

export const createAuthBrand = (t: AuthTranslator) => ({
  name: t('brand'),
  workspace: t('workspace'),
  description: t('loginLead'),
});
