import type {
  ApiPath,
  FormBody,
  HttpMethod as ApiMethod,
  IsIdempotent,
  JsonBody,
  PathParams,
  PathsFor,
  QueryParams,
  ResponseBody,
} from '@dukani/contracts';
import type { OperationId } from '@dukani/domain';
import type { HttpClient, HttpMethod } from './http-client';

type ArgPath<P extends ApiPath, M extends ApiMethod> = [PathParams<P, M>] extends [never]
  ? { readonly path?: undefined }
  : { readonly path: PathParams<P, M> };
type ArgQuery<P extends ApiPath, M extends ApiMethod> = [QueryParams<P, M>] extends [never]
  ? { readonly query?: undefined }
  : { readonly query?: QueryParams<P, M> };
type ArgBody<P extends ApiPath, M extends ApiMethod> = [JsonBody<P, M>] extends [never]
  ? [FormBody<P, M>] extends [never]
    ? { readonly body?: undefined }
    : { readonly form: FormData }
  : { readonly body: JsonBody<P, M> };
type ArgOperation<P extends ApiPath, M extends ApiMethod> = IsIdempotent<P, M> extends true
  ? { readonly operationId: OperationId }
  : { readonly operationId?: undefined };

/** Arguments of one endpoint, inferred from OpenAPI: required path params, typed query/body, idempotency. */
export type EndpointArgs<P extends ApiPath, M extends ApiMethod> = ArgPath<P, M> &
  ArgQuery<P, M> &
  ArgBody<P, M> &
  ArgOperation<P, M> & { readonly signal?: AbortSignal; readonly auth?: boolean };

export const fillPath = (template: string, params: Readonly<Record<string, unknown>> | undefined): string =>
  template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined || value === null) throw new Error(`Missing path parameter "${name}" for ${template}`);
    return encodeURIComponent(String(value));
  });

type Call<M extends ApiMethod> = <P extends PathsFor<M>>(path: P, args: EndpointArgs<P, M>) => Promise<ResponseBody<P, M>>;

/** Typed API facade: `api.post('/api/v1/stores/{storeId}/purchases', { path: { storeId }, body, operationId })`. */
export type Api = {
  readonly get: Call<'get'>;
  readonly post: Call<'post'>;
  readonly put: Call<'put'>;
  readonly patch: Call<'patch'>;
  readonly delete: Call<'delete'>;
};

export const createApi = (http: HttpClient): Api => {
  const call =
    (method: HttpMethod) =>
    async (path: string, args: {
      path?: Record<string, unknown>;
      query?: Record<string, unknown>;
      body?: unknown;
      form?: FormData;
      operationId?: OperationId;
      signal?: AbortSignal;
      auth?: boolean;
    }) => {
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
