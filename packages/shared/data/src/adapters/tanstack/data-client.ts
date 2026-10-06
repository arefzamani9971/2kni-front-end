import type { QueryClient } from '@tanstack/react-query';
import type { DataClient } from '../../types';
import { createQueryClient } from './create-query-client';

const clients = new WeakMap<DataClient, QueryClient>();

/** The underlying library client is never exposed through the public facade. */
export function createDataClient(): DataClient {
  const handle = Object.freeze({}) as DataClient;
  clients.set(handle, createQueryClient());
  return handle;
}

export function resolveDataClient(handle: DataClient): QueryClient {
  const client = clients.get(handle);
  if (!client) throw new Error('DataProvider requires a client created by createDataClient.');
  return client;
}
