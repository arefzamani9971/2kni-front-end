import { describe, expect, it, vi } from 'vitest';
import { newOperationId, type AppError } from '@dukani/domain';
import { createApi, fillPath } from './api';
import { HttpError, NetworkError } from './errors';
import { compose, type HttpClient, type HttpRequest } from './http-client';
import { withAuth } from './decorators/with-auth';
import { withErrorMapping } from './decorators/with-error-mapping';
import { withIdempotency } from './decorators/with-idempotency';
import { withRetry } from './decorators/with-retry';

const recorder = (impl: (req: HttpRequest, call: number) => unknown) => {
  const calls: HttpRequest[] = [];
  const client: HttpClient = {
    async request<T>(req: HttpRequest) {
      calls.push(req);
      const data = await impl(req, calls.length);
      return { status: 200, data: data as T, headers: new Headers() };
    },
  };
  return { client, calls };
};

describe('fillPath', () => {
  it('fills and encodes path parameters', () => {
    expect(fillPath('/api/v1/stores/{storeId}/barcodes/{code}', { storeId: 's1', code: 'A B' })).toBe(
      '/api/v1/stores/s1/barcodes/A%20B',
    );
    expect(() => fillPath('/api/v1/stores/{storeId}', {})).toThrow();
  });
});

describe('decorators', () => {
  it('adds the Idempotency-Key from the operation id', async () => {
    const { client, calls } = recorder(() => ({}));
    const http = compose(client, withIdempotency);
    const op = newOperationId();
    await http.request({ method: 'POST', path: '/x', operationId: op });
    expect(calls[0]!.headers?.['Idempotency-Key']).toBe(op);
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    let token = 'old';
    const { client, calls } = recorder((req, n) => {
      if (n === 1) throw new HttpError(401, null, null);
      return { auth: req.headers?.Authorization };
    });
    const http = compose(
      client,
      withAuth({ getAccessToken: () => token, refresh: async () => ((token = 'new'), true), onSessionExpired: vi.fn() }),
    );
    const res = await http.request<{ auth: string }>({ method: 'GET', path: '/me' });
    expect(res.data.auth).toBe('Bearer new');
    expect(calls).toHaveLength(2);
  });

  it('retries GET and idempotent commands on transient failures only', async () => {
    const failing = () => recorder((_, n) => {
      if (n < 2) throw new NetworkError(false, true, false);
      return 'ok';
    });
    const get = failing();
    await compose(get.client, withRetry({ baseDelayMs: 1 })).request({ method: 'GET', path: '/a' });
    expect(get.calls).toHaveLength(2);

    const post = failing();
    await expect(compose(post.client, withRetry({ baseDelayMs: 1 })).request({ method: 'POST', path: '/a' })).rejects.toBeInstanceOf(NetworkError);
    expect(post.calls).toHaveLength(1);
  });

  it('maps ProblemDetails to AppError with camelCase field errors', async () => {
    const { client } = recorder(() => {
      throw new HttpError(400, { code: 'VALIDATION_FAILED', detail: 'x', errors: { 'Lines[0].Quantity': ['مقدار نامعتبر'] } }, null);
    });
    const error = (await compose(client, withErrorMapping).request({ method: 'POST', path: '/a' }).catch((e) => e)) as AppError;
    expect(error.kind).toBe('Validation');
    expect(error.fieldErrors?.['lines[0].quantity']).toEqual(['مقدار نامعتبر']);
  });

  it('turns a lost response of a command into an Unknown result', async () => {
    const { client } = recorder(() => {
      throw new NetworkError(false, true, true);
    });
    const error = (await compose(client, withErrorMapping).request({ method: 'POST', path: '/a' }).catch((e) => e)) as AppError;
    expect(error.kind).toBe('Unknown');
  });
});

describe('createApi', () => {
  it('builds typed requests from OpenAPI paths', async () => {
    const { client, calls } = recorder(() => ({ stores: [], invitations: [], ownershipTransfers: [] }));
    const api = createApi(client);
    await api.get('/api/v1/stores', {});
    await api.get('/api/v1/stores/{storeId}/products', { path: { storeId: 's1' }, query: { q: 'خودکار', limit: 30 } });
    const op = newOperationId();
    await api.post('/api/v1/stores/{storeId}/product-entry/register', { path: { storeId: 's1' }, body: {}, operationId: op });
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      'GET /api/v1/stores',
      'GET /api/v1/stores/s1/products',
      'POST /api/v1/stores/s1/product-entry/register',
    ]);
    expect(calls[2]!.operationId).toBe(op);
    // @ts-expect-error — idempotent endpoints require an operation id
    await api.post('/api/v1/stores/{storeId}/product-entry/register', { path: { storeId: 's1' }, body: {} });
  });
});
