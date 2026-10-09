import { waitForRetry } from './wait-for-retry';
import { HttpError } from '../http-error';
import { NetworkError } from '../network-error';
import type { HttpDecorator, HttpRequest } from '../http-client.types';
import type { RetryOptions } from './with-retry.types';

/** Only safe requests are retried: GET, or commands carrying an operation id (the server replays them). */
const isSafe = (req: HttpRequest) => req.method === 'GET' || !!req.operationId;

const isTransient = (e: unknown) =>
  (e instanceof NetworkError && !e.offline) ||
  (e instanceof HttpError && (e.status === 502 || e.status === 503 || e.status === 504));

export const withRetry =
  ({ retries = 2, baseDelayMs = 400 }: RetryOptions = {}): HttpDecorator =>
  (inner) => ({
    async request<T>(req: HttpRequest) {
      for (let attempt = 0; ; attempt++) {
        req.signal?.throwIfAborted();
        try {
          return await inner.request<T>(req);
        } catch (e) {
          if (!isSafe(req) || !isTransient(e) || attempt >= retries) throw e;
          await waitForRetry(baseDelayMs * 2 ** attempt, req.signal);
        }
      }
    },
  });
