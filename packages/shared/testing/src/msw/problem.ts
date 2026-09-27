import { HttpResponse } from 'msw';

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

/** Same shape as backend `ProblemDetailsMapping`: message in `title`, stable `code`, optional field `errors`. */
export const problemResponse = (p: MockProblem) =>
  HttpResponse.json(
    { type: `https://docs.dukani.ir/errors/${p.code}`, title: p.message, status: p.status, code: p.code, ...(p.errors ? { errors: p.errors } : {}) },
    { status: p.status, headers: { 'Content-Type': 'application/problem+json' } },
  );

/** Error factories named after the backend `Throw` helpers. */
export const fail = {
  validation: (field: string, message: string, code = 'VALIDATION_FAILED') => new MockProblem(400, code, message, { [field]: [message] }),
  fields: (code: string, message: string, errors: Record<string, string[]>) => new MockProblem(400, code, message, errors),
  rule: (code: string, message: string) => new MockProblem(422, code, message),
  notFound: (what: string) => new MockProblem(404, 'NOT_FOUND', `${what} پیدا نشد.`),
  conflict: (code: string, message: string) => new MockProblem(409, code, message),
  versionConflict: () => new MockProblem(409, 'VERSION_CONFLICT', 'این اطلاعات هم‌زمان تغییر کرده است؛ دوباره بازبینی کنید.'),
  forbidden: (code = 'PERMISSION_DENIED', message = 'اجازه انجام این کار را ندارید.') => new MockProblem(403, code, message),
  unauthorized: (code = 'UNAUTHORIZED', message = 'نشست شما تمام شده است؛ دوباره وارد شوید.') => new MockProblem(401, code, message),
};
