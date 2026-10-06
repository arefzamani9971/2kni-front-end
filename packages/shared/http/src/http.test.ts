import { describe, expect, it, vi } from 'vitest';
import { newOperationId, type AppError } from '@dukani/domain';
import { createApi, fillPath } from './api';
import { HttpError } from './http-error';
import { NetworkError } from './network-error';
import { compose } from './http-client';
import type { HttpClient, HttpRequest } from './http-client.types';
import { withAuth } from './decorators/with-auth';
import { withErrorMapping } from './decorators/with-error-mapping';
import { withIdempotency } from './decorators/with-idempotency';
import { withRetry } from './decorators/with-retry';
import { createFetchAdapter } from './fetch-adapter';

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
  it.each([undefined, 'same-origin'] as const)(
    'uses explicit BFF credentials while keeping API default (%s)',
    async (credentials) => {
      const fetchImpl = vi.fn(async () => Response.json({ ok: true }));
      await createFetchAdapter({ baseUrl: '', credentials, fetchImpl }).request({
        method: 'POST',
        path: '/bff/auth/verify',
      });
      expect(fetchImpl).toHaveBeenCalledWith(
        '/bff/auth/verify',
        expect.objectContaining({ credentials: credentials ?? 'omit' }),
      );
    },
  );
  it('preserves temporary refresh errors without ending the session', async () => {
    const error = { kind: 'Server', code: 'REFRESH_UNAVAILABLE', message: 'retry' } as const;
    const expired = vi.fn();
    const { client } = recorder(() => {
      throw new HttpError(401, null, null);
    });
    const http = compose(
      client,
      withAuth({
        getAccessToken: () => 'a',
        refresh: async () => {
          throw error;
        },
        onSessionExpired: expired,
      }),
      withErrorMapping,
    );
    await expect(http.request({ method: 'GET', path: '/me' })).rejects.toBe(error);
    expect(expired).not.toHaveBeenCalled();
  });

  it('ends the session when the replay is also unauthorized', async () => {
    const expired = vi.fn();
    const { client, calls } = recorder(() => {
      throw new HttpError(401, null, null);
    });
    const http = compose(
      client,
      withAuth({ getAccessToken: () => 'a', refresh: async () => true, onSessionExpired: expired }),
    );
    await expect(http.request({ method: 'GET', path: '/me' })).rejects.toBeInstanceOf(HttpError);
    expect(expired).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(2);
  });

  it.each([200, 401])(
    'discards late HTTP %s from an old identity without refreshing or logging out the new one',
    async (status) => {
      let version = 1;
      let finish!: () => void;
      const pending = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const { client } = recorder(async () => {
        await pending;
        if (status === 401) throw new HttpError(401, null, null);
        return 'old';
      });
      const refresh = vi.fn(async () => true);
      const expired = vi.fn();
      const http = compose(
        client,
        withAuth({
          getAccessToken: () => 'a',
          getSessionVersion: () => version,
          refresh,
          onSessionExpired: expired,
        }),
      );
      const request = http.request({ method: 'GET', path: '/me' });
      const rejected = expect(request).rejects.toMatchObject({ name: 'AbortError' });
      version++;
      finish();
      await rejected;
      expect(refresh).not.toHaveBeenCalled();
      expect(expired).not.toHaveBeenCalled();
    },
  );

  it('uses an already rotated token when an old request returns 401', async () => {
    let token = 'old';
    const refresh = vi.fn(async () => true);
    const { client, calls } = recorder((_req, call) => {
      if (call === 1) {
        token = 'new';
        throw new HttpError(401, null, null);
      }
      return 'ok';
    });
    await compose(
      client,
      withAuth({ getAccessToken: () => token, refresh, onSessionExpired: vi.fn() }),
    ).request({ method: 'GET', path: '/me' });
    expect(calls[1]?.headers?.Authorization).toBe('Bearer new');
    expect(refresh).not.toHaveBeenCalled();
  });
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
      withAuth({
        getAccessToken: () => token,
        refresh: async () => ((token = 'new'), true),
        onSessionExpired: vi.fn(),
      }),
    );
    const res = await http.request<{ auth: string }>({ method: 'GET', path: '/me' });
    expect(res.data.auth).toBe('Bearer new');
    expect(calls).toHaveLength(2);
  });

  it('ends a revoked session without trying to refresh it', async () => {
    const refresh = vi.fn(async () => true);
    const onSessionExpired = vi.fn();
    const { client, calls } = recorder(() => {
      throw new HttpError(401, { status: 401, title: 'نشست بسته شد', code: 'SESSION_REVOKED' }, null);
    });
    const http = compose(client, withAuth({ getAccessToken: () => 'old', refresh, onSessionExpired }));
    await expect(http.request({ method: 'GET', path: '/me' })).rejects.toBeInstanceOf(HttpError);
    expect(refresh).not.toHaveBeenCalled();
    expect(onSessionExpired).toHaveBeenCalledOnce();
    expect(calls).toHaveLength(1);
  });

  it('retries GET and idempotent commands on transient failures only', async () => {
    const failing = () =>
      recorder((_, n) => {
        if (n < 2) throw new NetworkError(false, true, false);
        return 'ok';
      });
    const get = failing();
    await compose(get.client, withRetry({ baseDelayMs: 1 })).request({ method: 'GET', path: '/a' });
    expect(get.calls).toHaveLength(2);

    const post = failing();
    await expect(
      compose(post.client, withRetry({ baseDelayMs: 1 })).request({ method: 'POST', path: '/a' }),
    ).rejects.toBeInstanceOf(NetworkError);
    expect(post.calls).toHaveLength(1);
  });

  it('maps ProblemDetails to AppError with camelCase field errors', async () => {
    const { client } = recorder(() => {
      throw new HttpError(
        400,
        { code: 'VALIDATION_FAILED', detail: 'x', errors: { 'Lines[0].Quantity': ['مقدار نامعتبر'] } },
        null,
      );
    });
    const error = (await compose(client, withErrorMapping)
      .request({ method: 'POST', path: '/a' })
      .catch((e) => e)) as AppError;
    expect(error.kind).toBe('Validation');
    expect(error.fieldErrors?.['lines[0].quantity']).toEqual(['مقدار نامعتبر']);
  });

  it('keeps the retry wait of a rate-limited error', async () => {
    const { client } = recorder(() => {
      throw new HttpError(422, { code: 'OTP_RATE_LIMITED', title: 'x', retryAfterSeconds: 42 }, null);
    });
    const error = (await compose(client, withErrorMapping)
      .request({ method: 'POST', path: '/a' })
      .catch((e) => e)) as AppError;
    expect(error.retryAfterSeconds).toBe(42);
  });

  it('turns a lost response of a command into an Unknown result', async () => {
    const { client } = recorder(() => {
      throw new NetworkError(false, true, true);
    });
    const error = (await compose(client, withErrorMapping)
      .request({ method: 'POST', path: '/a' })
      .catch((e) => e)) as AppError;
    expect(error.kind).toBe('Unknown');
  });
});

describe('createApi', () => {
  it('builds typed requests from OpenAPI paths', async () => {
    const { client, calls } = recorder(() => ({ stores: [], invitations: [], ownershipTransfers: [] }));
    const api = createApi(client);
    await api.get('/api/v1/stores', {});
    await api.get('/api/v1/stores/{storeId}/products', {
      path: { storeId: 's1' },
      query: { q: 'خودکار', limit: 30 },
    });
    const op = newOperationId();
    await api.post('/api/v1/stores/{storeId}/product-entry/register', {
      path: { storeId: 's1' },
      body: {},
      operationId: op,
    });
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
