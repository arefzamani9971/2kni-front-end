import type { SessionTokens } from '@dukani/platform';
import type { OtpChallenge } from '../domain/otp-challenge';

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
  clear(): void;
};
