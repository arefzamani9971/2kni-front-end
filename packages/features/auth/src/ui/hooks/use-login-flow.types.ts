import type { OtpChallenge } from '../../domain/otp-challenge.types';
export type UseLoginFlowOptions = {
  readonly defaultMobile?: string;
  readonly onCodeSent: (challenge: OtpChallenge) => void;
};
