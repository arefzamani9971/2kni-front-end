import type { ReactNode } from 'react';
import type { OtpChallenge } from '../../domain/otp-challenge.types';

export type LoginScreenProps = {
  /** Overrides the layout's title (seller «ورود به دکانی», customer «ورود به حساب مشتری»). */
  readonly title?: ReactNode;
  /** Overrides the layout's intro line. */
  readonly intro?: ReactNode;
  /** Customer layout: context line under the title (default «دکانی»). */
  readonly context?: ReactNode;
  readonly onBack?: () => void;
  readonly defaultMobile?: string;
  readonly onCodeSent: (challenge: OtpChallenge) => void;
};
