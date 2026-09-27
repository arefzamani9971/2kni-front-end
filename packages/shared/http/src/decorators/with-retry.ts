import { HttpError, NetworkError } from '../errors';
import type { HttpDecorator, HttpRequest } from '../http-client';

export type RetryOptions = { readonly retries?: number; readonly baseDelayMs?: number };

/** Only safe requests are retried: GET, or commands carrying an operation id (the server replays them). */
const isSafe = (req: HttpRequest) => req.method === 'GET' || !!req.operationId;

const isTransient = (e: unknown) =>
  (e instanceof NetworkError && !e.offline) || (e instanceof HttpError && (e.status === 502 || e.status === 503 || e.status === 504));

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(signal.reason);
    });
  });

export const withRetry =
  ({ retries = 2, baseDelayMs = 400 }: RetryOptions = {}): HttpDecorator =>
  (inner) => ({
    async request<T>(req: HttpRequest) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await inner.request<T>(req);
        } catch (e) {
          if (!isSafe(req) || !isTransient(e) || attempt >= retries) throw e;
          await sleep(baseDelayMs * 2 ** attempt, req.signal);
        }
      }
    },
  });
