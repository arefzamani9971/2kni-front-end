'use client';
import { useActiveStore } from '@dukani/platform';
import type { CatalogFormSessionProps } from './CatalogFormSession.types';
import { FormSessionBody } from './FormSessionBody';

/** Per store and form id: a store switch remounts the session so another store's draft never leaks in. */
export function CatalogFormSession<T>(props: CatalogFormSessionProps<T>) {
  const store = useActiveStore();
  return <FormSessionBody key={store.id + ':' + props.id} {...props} />;
}
