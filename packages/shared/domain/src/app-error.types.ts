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

/** A stable field code (e.g. `REQUIRED`, `TOO_LONG`, `MOBILE_INVALID`) and the values its message uses. */
export type FieldErrorReason = {
  readonly code: string;
  readonly params?: Readonly<Record<string, unknown>> | null;
};

export type AppError = {
  readonly kind: AppErrorKind;
  /** Stable backend code such as `STOCK_NOT_ENOUGH`, or a client code such as `NETWORK`. */
  readonly code: string;
  readonly message: string;
  /** Transport fallback text is translated by the presentation layer. */
  readonly messageSource?: 'fallback' | 'server';
  readonly status?: number;
  /** camelCase field → messages (400 VALIDATION_FAILED). */
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  /** camelCase field → machine-readable reasons, in the same order as `fieldErrors` (backend `errorDetails`). */
  readonly fieldDetails?: Readonly<Record<string, readonly FieldErrorReason[]>>;
  /** Rate-limited errors (`OTP_RATE_LIMITED`, `RATE_LIMITED`): seconds until the server accepts a retry. */
  readonly retryAfterSeconds?: number;
};
