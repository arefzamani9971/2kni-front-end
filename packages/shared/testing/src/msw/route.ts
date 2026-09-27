import { delay, http, HttpResponse, type HttpHandler } from 'msw';
import type { HttpMethod, JsonBody, PathParams, PathsFor, ResponseBody } from '@dukani/contracts';
import { MockProblem, problemResponse } from './problem';

export type MockRequestContext<P extends PathsFor<M>, M extends HttpMethod> = {
  /** Path params as strings (`{ storeId }`). */
  readonly params: [PathParams<P, M>] extends [never] ? Record<string, never> : { readonly [K in keyof PathParams<P, M>]: string };
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

let options: Required<MockOptions> = { baseUrl: '*', latency: 'real' };
export const configureMocks = (o: MockOptions) => (options = { ...options, ...o });

// `/api/v1/stores/{storeId}` → `<base>/api/v1/stores/:storeId`
const toMswPath = (path: string) => `${options.baseUrl.replace(/\/$/, '')}${path.replace(/\{(\w+)\}/g, ':$1')}`;

/** Idempotent replay: same Idempotency-Key → same response (backend `IdempotencyFilter`). */
const replays = new Map<string, { status: number; body: unknown }>();
export const resetReplays = () => replays.clear();

const wait = async () => {
  if (options.latency === 'none' || options.latency === 0) return;
  await delay(options.latency === 'real' ? 'real' : options.latency);
};

const define =
  <M extends HttpMethod>(method: M) =>
  <P extends PathsFor<M>>(path: P, resolver: MockResolver<P, M>): HttpHandler =>
    http[method](toMswPath(path), async ({ request, params }) => {
      await wait();
      const idempotencyKey = request.headers.get('Idempotency-Key');
      const replayKey = idempotencyKey ? `${method}:${new URL(request.url).pathname}:${idempotencyKey}` : null;
      const cached = replayKey ? replays.get(replayKey) : undefined;
      if (cached) return HttpResponse.json(cached.body as never, { status: cached.status });
      try {
        const text = method === 'get' || method === 'delete' ? '' : await request.clone().text();
        const result = await resolver({
          params: params as never,
          query: new URL(request.url).searchParams,
          body: (text ? JSON.parse(text) : undefined) as JsonBody<P, M>,
          request,
          idempotencyKey,
        });
        if (result === null || result === undefined) return new HttpResponse(null, { status: 204 });
        if (replayKey) replays.set(replayKey, { status: 200, body: result });
        return HttpResponse.json(result as never);
      } catch (e) {
        if (e instanceof MockProblem) return problemResponse(e);
        console.error('[mock-api]', e);
        return HttpResponse.json({ title: 'خطای داخلی سرور ماک', status: 500, code: 'INTERNAL' }, { status: 500 });
      }
    });

/**
 * Contract-typed MSW routes: path, params, body and the returned DTO are checked against OpenAPI,
 * so mocks break at compile time when the backend contract changes.
 */
export const route = {
  get: define('get'),
  post: define('post'),
  put: define('put'),
  patch: define('patch'),
  delete: define('delete'),
};
