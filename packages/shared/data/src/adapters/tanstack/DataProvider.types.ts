import type { ReactNode } from 'react';
import type { DataClient } from '../../types';

/** Either an injected client (tests, app composition) or a scope key that owns its own cache. */
export type DataProviderProps = { children: ReactNode } & (
  { client?: DataClient; scopeKey?: never } | { client?: never; scopeKey: string | number }
);
