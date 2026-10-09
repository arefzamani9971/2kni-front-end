import type { AppErrorKind } from '@dukani/domain';

/** Backend error codes by client error kind (architecture §4). Unlisted 422/400 codes are business rules. */
export const KIND_BY_CODE: Readonly<Record<string, AppErrorKind>> = {
  VALIDATION_FAILED: 'Validation',
  MOBILE_INVALID: 'Validation',
  OTP_INVALID: 'Validation',
  QUANTITY_INVALID: 'Validation',
  BARCODE_INVALID: 'Validation',
  PRODUCTION_AFTER_EXPIRY: 'Validation',
  REQUIRED_ATTRIBUTE_MISSING: 'Validation',
  FILE_TOO_LARGE: 'Validation',
  FILE_TYPE_NOT_ALLOWED: 'Validation',
  UNAUTHORIZED: 'Unauthorized',
  SESSION_REVOKED: 'Unauthorized',
  REFRESH_TOKEN_INVALID: 'Unauthorized',
  USER_BLOCKED: 'Blocked',
  PERMISSION_DENIED: 'Permission',
  STORE_ACCESS_DENIED: 'Permission',
  NOT_FOUND: 'NotFound',
  VERSION_CONFLICT: 'Conflict',
  ORDER_VERSION_STALE: 'Conflict',
  OPERATION_IN_PROGRESS: 'Conflict',
  PRICE_CHANGED: 'Conflict',
  IDEMPOTENCY_KEY_REQUIRED: 'Bug',
  // same operation id sent with a different body: a client bug, not "data changed" (never a Conflict)
  IDEMPOTENCY_BODY_MISMATCH: 'Bug',
  FEATURE_NOT_RELEASED: 'NotReleased',
};

/** Diagnostic fallbacks; localized user-facing text belongs to UI. */
export const DEFAULT_MESSAGES: Readonly<Record<AppErrorKind, string>> = {
  Validation: 'Some information is invalid. Check the fields.',
  Unauthorized: 'Your session has expired. Sign in again.',
  Blocked: 'Your account is blocked. Contact support.',
  Permission: 'You do not have permission to do this.',
  NotFound: 'The requested item was not found.',
  Conflict: 'The information has changed. Review it again.',
  BusinessRule: 'This action is not allowed by the store rules.',
  NotReleased: 'This feature will be available soon.',
  Offline: 'There is no internet connection.',
  Unknown: 'The result is uncertain. We are checking it.',
  Server: 'Server error. Try again shortly.',
  Bug: 'An internal application error occurred.',
};
