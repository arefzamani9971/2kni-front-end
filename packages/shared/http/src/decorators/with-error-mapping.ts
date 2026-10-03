import { toAppError } from '../error-mapping';
import type { HttpDecorator, HttpRequest } from '../http-client.types';

/** Outermost decorator: callers only ever see `AppError`. */
export const withErrorMapping: HttpDecorator = (inner) => ({
  async request<T>(req: HttpRequest) {
    try {
      return await inner.request<T>(req);
    } catch (e) {
      throw toAppError(e);
    }
  },
});
