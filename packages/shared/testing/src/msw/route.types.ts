import type { HttpMethod, JsonBody, PathParams, PathsFor, ResponseBody } from '@dukani/contracts';

export type MockRequestContext<P extends PathsFor<M>, M extends HttpMethod> = {
  /** Path params as strings (`{ storeId }`). */
  readonly params: [PathParams<P, M>] extends [never]
    ? Record<string, never>
    : { readonly [K in keyof PathParams<P, M>]: string };
  readonly query: URLSearchParams;
  readonly body: JsonBody<P, M>;
  readonly request: Request;
  readonly idempotencyKey: string | null;
};

/** Resolver returns the typed DTO (200), `null` (204), or throws `MockProblem`. */
export type MockResolver<P extends PathsFor<M>, M extends HttpMethod> = (
  ctx: MockRequestContext<P, M>,
) => ResponseBody<P, M> | null | Promise<ResponseBody<P, M> | null>;

export type MockOptions = {
  /** Base URL of the API; `*` matches any origin (default). */
  readonly baseUrl?: string;
  /** Simulated network latency in ms (default realistic range; 0 in tests). */
  readonly latency?: number | 'real' | 'none';
};
