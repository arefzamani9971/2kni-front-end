import type { OperationId } from '@dukani/domain';
import type { HttpClient, HttpMethod } from './http-client.types';
import type { Api } from './api.types';

export const fillPath = (template: string, params: Readonly<Record<string, unknown>> | undefined): string =>
  template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined || value === null)
      throw new Error(`Missing path parameter "${name}" for ${template}`);
    return encodeURIComponent(String(value));
  });

export const createApi = (http: HttpClient): Api => {
  const call =
    (method: HttpMethod) =>
    async (
      path: string,
      args: {
        path?: Record<string, unknown>;
        query?: Record<string, unknown>;
        body?: unknown;
        form?: FormData;
        operationId?: OperationId;
        signal?: AbortSignal;
        auth?: boolean;
      },
    ) => {
      const res = await http.request({
        method,
        path: fillPath(path, args.path),
        query: args.query,
        body: args.body,
        form: args.form,
        operationId: args.operationId,
        signal: args.signal,
        auth: args.auth,
      });
      return res.data;
    };
  return {
    get: call('GET') as Api['get'],
    post: call('POST') as Api['post'],
    put: call('PUT') as Api['put'],
    patch: call('PATCH') as Api['patch'],
    delete: call('DELETE') as Api['delete'],
  };
};
