import type { HttpClient, HttpDecorator } from './http-client.types';

/** Applies decorators in order: the first decorator wraps the transport, the last one is outermost. */
export const compose = (transport: HttpClient, ...decorators: readonly HttpDecorator[]): HttpClient =>
  decorators.reduce<HttpClient>((client, decorate) => decorate(client), transport);
