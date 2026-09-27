import { appError, type AppError, type AppErrorKind } from '@dukani/domain';
import { HttpError, NetworkError } from './errors';

/** Backend error codes by client error kind (architecture §4). Unlisted 422/400 codes are business rules. */
const KIND_BY_CODE: Readonly<Record<string, AppErrorKind>> = {
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
  FEATURE_NOT_RELEASED: 'NotReleased',
};

const KIND_BY_STATUS = (status: number): AppErrorKind => {
  if (status === 401) return 'Unauthorized';
  if (status === 403) return 'Permission';
  if (status === 404) return 'NotFound';
  if (status === 409) return 'Conflict';
  if (status >= 500) return 'Server';
  return 'BusinessRule';
};

const DEFAULT_MESSAGES: Readonly<Record<AppErrorKind, string>> = {
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

/** Lowercases the first letter of backend field keys (`Lines[0].Quantity` → `lines[0].quantity`). */
const camelField = (key: string): string =>
  key.split('.').map((part) => part.charAt(0).toLowerCase() + part.slice(1)).join('.');

export const toAppError = (e: unknown): AppError => {
  if (e instanceof HttpError) {
    const code = e.problem?.code ?? `HTTP_${e.status}`;
    const kind = KIND_BY_CODE[code] ?? KIND_BY_STATUS(e.status);
    const fieldErrors = e.problem?.errors
      ? Object.fromEntries(Object.entries(e.problem.errors).map(([k, v]) => [camelField(k), v]))
      : undefined;
    return appError(kind, code, e.problem?.detail ?? e.problem?.title ?? DEFAULT_MESSAGES[kind], { status: e.status, fieldErrors });
  }
  if (e instanceof NetworkError) {
    if (e.offline) return appError('Offline', 'OFFLINE', DEFAULT_MESSAGES.Offline);
    if (e.sent) return appError('Unknown', e.timedOut ? 'TIMEOUT' : 'NETWORK', DEFAULT_MESSAGES.Unknown);
    return appError('Server', 'NETWORK', 'ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.');
  }
  if (e instanceof DOMException && e.name === 'AbortError') return appError('Unknown', 'ABORTED', 'درخواست لغو شد.');
  return appError('Bug', 'UNEXPECTED', DEFAULT_MESSAGES.Bug);
};
