import { HttpError } from '../http-error';
import type { HttpDecorator, HttpRequest } from '../http-client.types';
import type { TokenProvider } from './with-auth.types';

/**
 * Adds the Bearer token and retries once after a refresh on 401. A revoked session (`SESSION_REVOKED`, e.g. closed
 * from another device) cannot be refreshed, so it ends the session at once (F01).
 */
export const withAuth =
  (tokens: TokenProvider): HttpDecorator =>
  (inner) => ({
    async request<T>(req: HttpRequest) {
      if (req.auth === false) return inner.request<T>(req);
      const version = tokens.getSessionVersion?.();
      const sessionSignal = tokens.getSessionSignal?.();
      let sentToken: string | null = null;
      const assertCurrent = () => {
        if (version !== tokens.getSessionVersion?.() || req.signal?.aborted)
          throw new DOMException('Request scope ended', 'AbortError');
      };
      const send = async () => {
        assertCurrent();
        const token = tokens.getAccessToken();
        sentToken = token;
        const result = await inner.request<T>({
          ...req,
          signal: sessionSignal
            ? req.signal
              ? AbortSignal.any([sessionSignal, req.signal])
              : sessionSignal
            : req.signal,
          headers: { ...req.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        assertCurrent();
        return result;
      };
      try {
        return await send();
      } catch (e) {
        assertCurrent();
        if (!(e instanceof HttpError) || e.status !== 401) throw e;
        if (e.problem?.code !== 'SESSION_REVOKED') {
          // Another concurrent request may already have rotated this token.
          const renewed = tokens.getAccessToken() !== sentToken || (await tokens.refresh());
          assertCurrent();
          if (renewed) {
            try {
              return await send();
            } catch (retryError) {
              assertCurrent();
              if (retryError instanceof HttpError && retryError.status === 401) tokens.onSessionExpired();
              throw retryError;
            }
          }
        }
        tokens.onSessionExpired();
        throw e;
      }
    },
  });
