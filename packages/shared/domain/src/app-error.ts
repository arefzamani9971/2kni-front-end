import type { AppError, AppErrorKind } from './app-error.types';

export const isAppError = (e: unknown): e is AppError =>
  typeof e === 'object' && e !== null && 'kind' in e && 'code' in e && 'message' in e;

export const appError = (
  kind: AppErrorKind,
  code: string,
  message: string,
  extra: Partial<AppError> = {},
): AppError => ({
  kind,
  code,
  message,
  ...extra,
});
