import type { SessionTokens } from '@dukani/platform';
import type { OtpChallenge } from '../domain/otp-challenge.types';

export type VerifiedSession = { readonly tokens: SessionTokens; readonly isNewUser: boolean };

/** Port to the Identity module. Adapters: direct API (mock mode) and BFF (live; refresh token in httpOnly cookie). */
export type AuthGateway = {
  requestOtp(mobile: string): Promise<OtpChallenge>;
  verifyOtp(challenge: OtpChallenge, code: string): Promise<VerifiedSession>;
};

/** Keeps the pending challenge across the login → OTP navigation (and a refresh of the OTP page). */
export type ChallengeStore = {
  save(challenge: OtpChallenge): void;
  load(): OtpChallenge | null;
  /** «تغییر شماره»: drops the challenge but keeps its number for the login form. */
  discard(): void;
  /** Number of the last challenge (prefills the login form after «تغییر شماره»). */
  lastMobile(): string | null;
  /** Signed in: forgets the challenge and the number. */
  clear(): void;
};
