import { toAppError } from './error-mapping';
import { HttpError } from './http-error';
import { NetworkError } from './network-error';
describe('error message provenance', () => {
  it('marks missing ProblemDetails text as a presentation fallback', () => {
    expect(toAppError(new HttpError(503, null, null))).toMatchObject({
      kind: 'Server',
      code: 'HTTP_503',
      messageSource: 'fallback',
    });
  });
  it('preserves backend details and field errors', () => {
    expect(
      toAppError(
        new HttpError(
          400,
          { code: 'VALIDATION_FAILED', detail: 'Fix the field', errors: { Name: ['Required'] } },
          null,
        ),
      ),
    ).toMatchObject({
      message: 'Fix the field',
      messageSource: 'server',
      fieldErrors: { name: ['Required'] },
    });
  });
  it('keeps the machine-readable field reasons next to the messages', () => {
    const error = toAppError(
      new HttpError(
        400,
        {
          code: 'VALIDATION_FAILED',
          title: 'x',
          errors: { Name: ['نام حداکثر 120 حرف است.'] },
          errorDetails: { Name: [{ code: 'TOO_LONG', params: { max: 120 } }] },
        },
        null,
      ),
    );
    expect(error.fieldDetails).toEqual({ name: [{ code: 'TOO_LONG', params: { max: 120 } }] });
    expect(error.fieldErrors).toEqual({ name: ['نام حداکثر 120 حرف است.'] });
  });
  it('keeps response uncertainty distinct from a request that was not sent', () => {
    expect(toAppError(new NetworkError(false, true, true))).toMatchObject({
      kind: 'Unknown',
      messageSource: 'fallback',
    });
    expect(toAppError(new NetworkError(false, false, false))).toMatchObject({
      kind: 'Server',
      code: 'NETWORK',
      messageSource: 'fallback',
    });
  });
});
