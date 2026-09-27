import type { OperationId } from '@dukani/domain';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpRequest = {
  readonly method: HttpMethod;
  /** Absolute API path, e.g. `/api/v1/stores/…`; the base URL is added by the transport adapter. */
  readonly path: string;
  readonly query?: Readonly<Record<string, unknown>>;
  readonly body?: unknown;
  readonly form?: FormData;
  readonly headers?: Readonly<Record<string, string>>;
  /** Final (money/stock) commands carry one id per user action; retries reuse it. */
  readonly operationId?: OperationId;
  readonly signal?: AbortSignal;
  /** Set to false for anonymous endpoints (OTP, storefront browsing, public invoice). */
  readonly auth?: boolean;
};

export type HttpResponse<T> = { readonly status: number; readonly data: T; readonly headers: Headers };

/** Port: every transport (fetch, test double) and every decorator implements it. */
export interface HttpClient {
  request<T>(req: HttpRequest): Promise<HttpResponse<T>>;
}

export type HttpDecorator = (inner: HttpClient) => HttpClient;

/** Applies decorators in order: the first decorator wraps the transport, the last one is outermost. */
export const compose = (transport: HttpClient, ...decorators: readonly HttpDecorator[]): HttpClient =>
  decorators.reduce<HttpClient>((client, decorate) => decorate(client), transport);
