import type {
  HttpMethod as ApiMethod,
  ApiPath,
  FormBody,
  IsIdempotent,
  JsonBody,
  PathParams,
  PathsFor,
  QueryParams,
  ResponseBody,
} from '@dukani/contracts';
import type { OperationId } from '@dukani/domain';

export type ArgPath<P extends ApiPath, M extends ApiMethod> = [PathParams<P, M>] extends [never]
  ? { readonly path?: undefined }
  : { readonly path: PathParams<P, M> };

export type ArgQuery<P extends ApiPath, M extends ApiMethod> = [QueryParams<P, M>] extends [never]
  ? { readonly query?: undefined }
  : { readonly query?: QueryParams<P, M> };

export type ArgBody<P extends ApiPath, M extends ApiMethod> = [JsonBody<P, M>] extends [never]
  ? [FormBody<P, M>] extends [never]
    ? { readonly body?: undefined }
    : { readonly form: FormData }
  : { readonly body: JsonBody<P, M> };

export type ArgOperation<P extends ApiPath, M extends ApiMethod> =
  IsIdempotent<P, M> extends true
    ? { readonly operationId: OperationId }
    : { readonly operationId?: undefined };

/** Arguments of one endpoint, inferred from OpenAPI: required path params, typed query/body, idempotency. */
export type EndpointArgs<P extends ApiPath, M extends ApiMethod> = ArgPath<P, M> &
  ArgQuery<P, M> &
  ArgBody<P, M> &
  ArgOperation<P, M> & { readonly signal?: AbortSignal; readonly auth?: boolean };

export type Call<M extends ApiMethod> = <P extends PathsFor<M>>(
  path: P,
  args: EndpointArgs<P, M>,
) => Promise<ResponseBody<P, M>>;

/** Typed API facade: `api.post('/api/v1/stores/{storeId}/purchases', { path: { storeId }, body, operationId })`. */
export type Api = {
  readonly get: Call<'get'>;
  readonly post: Call<'post'>;
  readonly put: Call<'put'>;
  readonly patch: Call<'patch'>;
  readonly delete: Call<'delete'>;
};
