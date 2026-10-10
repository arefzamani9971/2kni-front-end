'use client';
import { useEffect, useState } from 'react';

/** Latest value after `ms` without changes; search inputs use it so typing does not query or rewrite the URL per keystroke. */
export function useDebounced<T>(value: T, ms = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
