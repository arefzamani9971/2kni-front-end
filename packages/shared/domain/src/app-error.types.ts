/** Normalized client-side error, mapped from ProblemDetails or transport failures (architecture §4). */
export type AppErrorKind =
  | 'Validation'
  | 'Unauthorized'
  | 'Blocked'
  | 'Permission'
  | 'NotFound'
  | 'Conflict'
  | 'BusinessRule'
  | 'NotReleased'
  | 'Offline'
  | 'Unknown'
  | 'Server'
  | 'Bug';

export type AppError = {
  readonly kind: AppErrorKind;
  /** Stable backend code such as `STOCK_NOT_ENOUGH`, or a client code such as `NETWORK`. */
  readonly code: string;
  readonly message: string;
  readonly status?: number;
  /** camelCase field → messages (400 VALIDATION_FAILED). */
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  /** Rate-limited errors (`OTP_RATE_LIMITED`, `RATE_LIMITED`): seconds until the server accepts a retry. */
  readonly retryAfterSeconds?: number;
};
