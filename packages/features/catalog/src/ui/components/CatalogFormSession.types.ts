import type { ReactNode } from 'react';

/** One catalog form's unfinished values: restored on open, autosaved, cleared on success, confirmed on leave. */
export type FormSession<T> = {
  initial: T;
  persist: (value: T) => Promise<boolean>;
  clear: () => Promise<void>;
  leave: (value: T, done: () => void) => void;
};

export type CatalogFormSessionProps<T> = {
  id: string;
  defaults: T;
  children: (session: FormSession<T>) => ReactNode;
};
