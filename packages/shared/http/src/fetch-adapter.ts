import type { ProblemDetails } from '@dukani/contracts';
import { HttpError, NetworkError } from './errors';
import type { HttpClient, HttpRequest, HttpResponse } from './http-client';

export type FetchAdapterOptions = {
  readonly baseUrl: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
  readonly isOnline?: () => boolean;
};

export const buildQueryString = (query: HttpRequest['query']): string => {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, String(v)));
    else params.append(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
};

const parseBody = async (res: Response): Promise<unknown> => {
  if (res.status === 204) return undefined;
  const type = res.headers.get('content-type') ?? '';
  if (type.includes('json')) return res.json();
  const text = await res.text();
  return text === '' ? undefined : text;
};

/** Transport adapter over `fetch`. JSON in, JSON out; ProblemDetails on failure. */
export const createFetchAdapter = (opts: FetchAdapterOptions): HttpClient => {
  const doFetch = opts.fetchImpl ?? ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));
  const isOnline = opts.isOnline ?? (() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  return {
    async request<T>(req: HttpRequest): Promise<HttpResponse<T>> {
      const url = `${opts.baseUrl.replace(/\/$/, '')}${req.path}${buildQueryString(req.query)}`;
      const headers: Record<string, string> = { Accept: 'application/json', ...req.headers };
      let body: BodyInit | undefined;
      if (req.form) body = req.form;
      else if (req.body !== undefined) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(req.body);
      }
      const timeout = AbortSignal.timeout(opts.timeoutMs ?? 20_000);
      const signal = req.signal ? AbortSignal.any([req.signal, timeout]) : timeout;
      let res: Response;
      try {
        res = await doFetch(url, { method: req.method, headers, body, signal, credentials: 'omit' });
      } catch (e) {
        if (req.signal?.aborted) throw e;
        const timedOut = timeout.aborted;
        throw new NetworkError(!isOnline(), req.method !== 'GET', timedOut);
      }
      const data = await parseBody(res);
      if (!res.ok) {
        const problem = typeof data === 'object' && data !== null ? (data as ProblemDetails) : null;
        throw new HttpError(res.status, problem, data);
      }
      return { status: res.status, data: data as T, headers: res.headers };
    },
  };
};
