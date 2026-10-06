'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { DataClient } from '../../types';
import { createDataClient, resolveDataClient } from './data-client';

type Props = { children: ReactNode } & (
  { client?: DataClient; scopeKey?: never } | { client?: never; scopeKey: string | number }
);

/** A new scope owns a new cache and remounts descendants before they can read the previous scope. */
export function DataProvider({ scopeKey, ...props }: Props) {
  return <OwnedDataProvider key={scopeKey ?? 'default'} {...props} />;
}

function OwnedDataProvider({ children, client }: { children: ReactNode; client?: DataClient }) {
  const [queryClient] = useState(() => resolveDataClient(client ?? createDataClient()));
  const lifetime = useRef({ mounts: 0 });
  useEffect(() => {
    const lease = lifetime.current;
    lease.mounts++;
    return () => {
      lease.mounts--;
      // StrictMode immediately replays effects; only dispose a genuinely unmounted owned client.
      queueMicrotask(() => {
        if (!client && lease.mounts === 0) queryClient.clear();
      });
    };
  }, [client, queryClient]);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
