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

export const DEFAULT_MESSAGES: Readonly<Record<AppErrorKind, string>> = {
  Validation: 'بعضی از اطلاعات درست نیست؛ کنار هر فیلد را ببینید.',
  Unauthorized: 'نشست شما تمام شده است؛ دوباره وارد شوید.',
  Blocked: 'حساب شما مسدود است؛ با پشتیبانی تماس بگیرید.',
  Permission: 'اجازه انجام این کار را ندارید.',
  NotFound: 'مورد درخواستی پیدا نشد.',
  Conflict: 'اطلاعات در این فاصله تغییر کرده است؛ دوباره بازبینی کنید.',
  BusinessRule: 'این کار با قواعد فروشگاه ممکن نیست.',
  NotReleased: 'این بخش به‌زودی فعال می‌شود.',
  Offline: 'اتصال اینترنت برقرار نیست.',
  Unknown: 'نتیجه روشن نیست؛ در حال بررسی نتیجه هستیم.',
  Server: 'خطای سرور؛ کمی بعد دوباره تلاش کنید.',
  Bug: 'خطای داخلی برنامه رخ داد.',
};
