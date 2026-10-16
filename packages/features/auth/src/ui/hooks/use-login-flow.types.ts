import type { OtpChallenge } from '../../domain/otp-challenge.types';
export type UseLoginFlowOptions = {
  readonly defaultMobile?: string;
  readonly onCodeSent: (challenge: OtpChallenge) => void;
};

/**
 * Danger alert of AUTH-01/AUTH-02. While the server wait of OTP_RATE_LIMITED runs, `waitUntil` is set and the screen
 * shows the ticking `RetryWait` instead of `description`.
 */
export type AuthAlert = {
  readonly title: string;
  readonly description: string | undefined;
  readonly waitUntil: number | null;
};
