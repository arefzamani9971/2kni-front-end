import { isAppError, type AppError } from '@dukani/domain';

/** Any thrown value as an AppError; unexpected values become a Bug. */
export const asAppError = (e: unknown): AppError | null =>
  e == null ? null : isAppError(e) ? e : { kind: 'Bug', code: 'UNEXPECTED', message: String(e) };
