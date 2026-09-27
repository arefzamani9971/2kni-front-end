import type { HttpDecorator, HttpRequest } from '../http-client';

/** Sends the operation id as `Idempotency-Key`; replays with the same key never create a second record. */
export const withIdempotency: HttpDecorator = (inner) => ({
  request: <T>(req: HttpRequest) =>
    inner.request<T>(req.operationId ? { ...req, headers: { ...req.headers, 'Idempotency-Key': req.operationId } } : req),
});
