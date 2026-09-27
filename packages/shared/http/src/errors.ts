import type { ProblemDetails } from '@dukani/contracts';

/** Non-2xx response (raised by the transport, turned into an AppError by `withErrorMapping`). */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly problem: ProblemDetails | null,
    readonly body: unknown,
  ) {
    super(problem?.detail ?? problem?.title ?? `HTTP ${status}`);
    this.name = 'HttpError';
  }
}

/** No response. `sent` tells whether the request body may have reached the server (unknown result). */
export class NetworkError extends Error {
  constructor(
    readonly offline: boolean,
    readonly sent: boolean,
    readonly timedOut: boolean,
  ) {
    super(offline ? 'offline' : timedOut ? 'timeout' : 'network');
    this.name = 'NetworkError';
  }
}
