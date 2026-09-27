import type { Ref, RefObject } from 'react';

/** Forwards an element to a caller ref (callback or object) — used when a field also keeps its own ref. */
export function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as RefObject<T | null>).current = value;
}
