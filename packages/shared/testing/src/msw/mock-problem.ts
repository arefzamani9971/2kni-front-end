/** Thrown inside mock handlers; `route()` turns it into a ProblemDetails response like the backend. */
export class MockProblem extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly errors?: Record<string, string[]>,
    /** Rate-limited errors: seconds until a retry is accepted (backend `retryAfterSeconds` + Retry-After). */
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
  }
}
