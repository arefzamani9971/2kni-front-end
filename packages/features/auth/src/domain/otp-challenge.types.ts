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

/** OTP screen states of Figma page 17 (otp-wrong, otp-expired, otp-limited, otp-send-failed) plus blocked. */
export type OtpProblem = 'wrong' | 'expired' | 'limited' | 'send-failed' | 'blocked' | 'other';
