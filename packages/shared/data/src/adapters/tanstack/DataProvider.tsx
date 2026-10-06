'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import type { DataClient } from '../../types';
import { createDataClient, resolveDataClient } from './data-client';

/** The client is fixed for this provider's lifetime; remount to replace it. */
export function DataProvider({ children, client }: { children: ReactNode; client?: DataClient }) {
  const [queryClient] = useState(() => resolveDataClient(client ?? createDataClient()));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
