// Type-level helpers that read request/response shapes straight from the generated OpenAPI types.
// A service declares only `METHOD + path`; params, query, body and result are inferred.
import type { paths } from './generated/schema';

export type ApiPath = keyof paths;
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type Defined<T> = Exclude<T, undefined | never>;

/** Paths that support a given method. */
export type PathsFor<M extends HttpMethod> = {
  [P in ApiPath]: Defined<paths[P][M]> extends never ? never : P;
}[ApiPath];

export type Operation<P extends ApiPath, M extends HttpMethod> = Defined<paths[P][M]>;

type Params<O> = O extends { parameters: infer X } ? X : never;

export type PathParams<P extends ApiPath, M extends HttpMethod> =
  Params<Operation<P, M>> extends { path: infer X } ? (X extends Record<string, unknown> ? X : never) : never;

export type QueryParams<P extends ApiPath, M extends HttpMethod> =
  Params<Operation<P, M>> extends { query?: infer X } ? (X extends Record<string, unknown> ? X : never) : never;

type RequestBodyOf<O> = O extends { requestBody?: infer R } ? NonNullable<R> : never;

type ContentOf<O, C extends string> = [RequestBodyOf<O>] extends [never]
  ? never
  : RequestBodyOf<O> extends { content: infer X }
    ? X extends Record<C, infer B>
      ? B
      : never
    : never;

export type JsonBody<P extends ApiPath, M extends HttpMethod> = ContentOf<Operation<P, M>, 'application/json'>;

export type FormBody<P extends ApiPath, M extends HttpMethod> = ContentOf<Operation<P, M>, 'multipart/form-data'>;

export type ResponseBody<P extends ApiPath, M extends HttpMethod> =
  Operation<P, M> extends { responses: { 200: { content: { 'application/json': infer R } } } } ? R : undefined;

/** `true` when the operation requires an `Idempotency-Key` header (♻ in endpoints.md). */
export type IsIdempotent<P extends ApiPath, M extends HttpMethod> =
  Params<Operation<P, M>> extends { header: { 'Idempotency-Key': string } } ? true : false;
