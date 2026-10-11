'use client';
import type { DataProviderProps } from './DataProvider.types';
import { OwnedDataProvider } from './OwnedDataProvider';

/** A new scope owns a new cache and remounts descendants before they can read the previous scope. */
export function DataProvider({ scopeKey, ...props }: DataProviderProps) {
  return <OwnedDataProvider key={scopeKey ?? 'default'} {...props} />;
}
