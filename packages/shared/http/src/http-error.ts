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
