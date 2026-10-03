import { appError, type AppError, type AppErrorKind } from '@dukani/domain';
import { HttpError } from './http-error';
import { NetworkError } from './network-error';
import { DEFAULT_MESSAGES, KIND_BY_CODE } from './error-mapping.constants';

const KIND_BY_STATUS = (status: number): AppErrorKind => {
  if (status === 401) return 'Unauthorized';
  if (status === 403) return 'Permission';
  if (status === 404) return 'NotFound';
  if (status === 409) return 'Conflict';
  if (status >= 500) return 'Server';
  return 'BusinessRule';
};

/** Lowercases the first letter of backend field keys (`Lines[0].Quantity` → `lines[0].quantity`). */
const camelField = (key: string): string =>
  key
    .split('.')
    .map((part) => part.charAt(0).toLowerCase() + part.slice(1))
    .join('.');

export const toAppError = (e: unknown): AppError => {
  if (e instanceof HttpError) {
    const code = e.problem?.code ?? `HTTP_${e.status}`;
    const kind = KIND_BY_CODE[code] ?? KIND_BY_STATUS(e.status);
    const fieldErrors = e.problem?.errors
      ? Object.fromEntries(Object.entries(e.problem.errors).map(([k, v]) => [camelField(k), v]))
      : undefined;
    return appError(kind, code, e.problem?.detail ?? e.problem?.title ?? DEFAULT_MESSAGES[kind], {
      status: e.status,
      fieldErrors,
    });
  }
  if (e instanceof NetworkError) {
    if (e.offline) return appError('Offline', 'OFFLINE', DEFAULT_MESSAGES.Offline);
    if (e.sent) return appError('Unknown', e.timedOut ? 'TIMEOUT' : 'NETWORK', DEFAULT_MESSAGES.Unknown);
    return appError('Server', 'NETWORK', 'ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.');
  }
  if (e instanceof DOMException && e.name === 'AbortError')
    return appError('Unknown', 'ABORTED', 'درخواست لغو شد.');
  return appError('Bug', 'UNEXPECTED', DEFAULT_MESSAGES.Bug);
};
