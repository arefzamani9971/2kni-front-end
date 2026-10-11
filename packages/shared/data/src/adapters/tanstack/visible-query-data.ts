import type { AppError } from '@dukani/domain';
/** A failed authorization refresh must not leave previously cached private data visible. */
export function visibleQueryData<T>(data: T | undefined, error: AppError | null): T | undefined {
  return error && ['Permission', 'Unauthorized', 'Blocked'].includes(error.kind) ? undefined : data;
}
