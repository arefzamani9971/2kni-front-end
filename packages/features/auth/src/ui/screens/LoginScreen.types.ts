import type { ReactNode } from 'react';
import type { OtpChallenge } from '../../domain/otp-challenge.types';

export type LoginScreenProps = {
  /** App Bar title (seller: «ورود به دکانی»). */
  readonly title?: ReactNode;
  readonly intro?: ReactNode;
  readonly onBack?: () => void;
  readonly defaultMobile?: string;
  readonly onCodeSent: (challenge: OtpChallenge) => void;
};
