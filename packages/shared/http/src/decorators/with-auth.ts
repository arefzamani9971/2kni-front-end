import { HttpError } from '../http-error';
import type { HttpDecorator, HttpRequest } from '../http-client.types';
import type { TokenProvider } from './with-auth.types';

/** Adds the Bearer token and retries once after a refresh on 401. */
export const withAuth =
  (tokens: TokenProvider): HttpDecorator =>
  (inner) => ({
    async request<T>(req: HttpRequest) {
      if (req.auth === false) return inner.request<T>(req);
      const send = () => {
        const token = tokens.getAccessToken();
        return inner.request<T>({
          ...req,
          headers: { ...req.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
      };
      try {
        return await send();
      } catch (e) {
        if (!(e instanceof HttpError) || e.status !== 401) throw e;
        if (await tokens.refresh()) return send();
        tokens.onSessionExpired();
        throw e;
      }
    },
  });
