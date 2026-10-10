import { HttpResponse } from 'msw';
import { MockProblem } from './mock-problem';

/** Like backend `Throw.Validation`: each field message gets the specific code, or `INVALID` under the generic one. */
const detailsOf = (p: MockProblem) =>
  Object.fromEntries(
    Object.entries(p.errors ?? {}).map(([field, messages]) => [
      field,
      messages.map(() => ({ code: p.code === 'VALIDATION_FAILED' ? 'INVALID' : p.code })),
    ]),
  );

/** Same shape as backend `ProblemDetailsMapping`: message in `title`, stable `code`, optional field `errors` + `errorDetails`. */
export const problemResponse = (p: MockProblem) =>
  HttpResponse.json(
    {
      type: `https://docs.dukani.ir/errors/${p.code}`,
      title: p.message,
      status: p.status,
      code: p.code,
      ...(p.errors ? { errors: p.errors, errorDetails: detailsOf(p) } : {}),
      ...(p.retryAfterSeconds ? { retryAfterSeconds: p.retryAfterSeconds } : {}),
    },
    {
      status: p.status,
      headers: {
        'Content-Type': 'application/problem+json',
        ...(p.retryAfterSeconds ? { 'Retry-After': String(p.retryAfterSeconds) } : {}),
      },
    },
  );

/** Error factories named after the backend `Throw` helpers. */
export const fail = {
  validation: (field: string, message: string, code = 'VALIDATION_FAILED') =>
    new MockProblem(400, code, message, { [field]: [message] }),
  fields: (code: string, message: string, errors: Record<string, string[]>) =>
    new MockProblem(400, code, message, errors),
  rule: (code: string, message: string) => new MockProblem(422, code, message),
  rateLimited: (code: string, message: string, waitMs: number) =>
    new MockProblem(422, code, message, undefined, waitMs > 0 ? Math.ceil(waitMs / 1000) : undefined),
  unavailable: (code: string, message: string) => new MockProblem(503, code, message),
  notFound: (what: string) => new MockProblem(404, 'NOT_FOUND', `${what} پیدا نشد.`),
  conflict: (code: string, message: string) => new MockProblem(409, code, message),
  versionConflict: () =>
    new MockProblem(409, 'VERSION_CONFLICT', 'این اطلاعات هم‌زمان تغییر کرده است؛ دوباره بازبینی کنید.'),
  forbidden: (code = 'PERMISSION_DENIED', message = 'اجازه انجام این کار را ندارید.') =>
    new MockProblem(403, code, message),
  unauthorized: (code = 'UNAUTHORIZED', message = 'نشست شما تمام شده است؛ دوباره وارد شوید.') =>
    new MockProblem(401, code, message),
};
