/** Thrown inside mock handlers; `route()` turns it into a ProblemDetails response like the backend. */
export class MockProblem extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}
