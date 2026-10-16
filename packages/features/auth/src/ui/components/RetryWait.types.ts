export type RetryWaitProps = {
  /** Epoch ms when the server accepts a retry (OTP_RATE_LIMITED `retryAfterSeconds`). */
  readonly until: number;
};
