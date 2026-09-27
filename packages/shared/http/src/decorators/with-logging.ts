import type { HttpDecorator, HttpRequest } from '../http-client';

export type HttpLogger = {
  debug(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
};

/** Logs method, path, status and duration; never bodies (mobile numbers, amounts). */
export const withLogging =
  (logger: HttpLogger): HttpDecorator =>
  (inner) => ({
    async request<T>(req: HttpRequest) {
      const started = Date.now();
      try {
        const res = await inner.request<T>(req);
        logger.debug('http', { method: req.method, path: req.path, status: res.status, ms: Date.now() - started });
        return res;
      } catch (e) {
        if (req.signal?.aborted) throw e; // cancelled by the caller (navigation, unmount): not a failure
        const code = typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: unknown }).code) : String(e);
        logger.warn('http failed', { method: req.method, path: req.path, ms: Date.now() - started, code });
        throw e;
      }
    },
  });
