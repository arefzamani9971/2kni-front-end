import type { QueryRefreshResult } from '../../types';
import { asAppError } from './app-error';

/** Never expose the observer result or return stale cached data as a successful refresh. */
export function refreshResult<T>(result: {
  data: T | undefined;
  error: unknown;
  isSuccess: boolean;
}): QueryRefreshResult<T> {
  if (result.isSuccess) return { ok: true, data: result.data as T };
  return {
    ok: false,
    error: asAppError(result.error) ?? {
      kind: 'Bug',
      code: 'REFRESH_INCOMPLETE',
      message: 'Refresh did not produce a result.',
    },
  };
}
