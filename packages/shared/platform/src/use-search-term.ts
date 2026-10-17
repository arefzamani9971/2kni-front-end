'use client';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH, searchTermLength } from '@dukani/domain';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SearchTerm, SearchTermOptions, SearchTermState } from './use-search-term.types';

/**
 * Autocomplete search policy (spec/front/autocomplete.md): nothing below the minimum of meaningful characters, a
 * trailing debounce after the last change, and `flush` for explicit submission such as a barcode scanner's Enter.
 * Falling below the minimum drops the timer and the previous term. Stale responses are the query's business: key
 * them with `term` so only the latest one is shown. A restored text (URL) is ready at once.
 */
export function useSearchTerm(
  value: string,
  { minLength = SEARCH_MIN_LENGTH, delayMs = SEARCH_DEBOUNCE_MS }: SearchTermOptions = {},
): SearchTerm {
  const text = value.trim();
  const long = searchTermLength(text) >= minLength;
  const [settled, setSettled] = useState(long ? text : '');
  useEffect(() => {
    // below the minimum the previous term is dropped at once; otherwise the text settles after the debounce
    const timer = setTimeout(() => setSettled(long ? text : ''), long ? delayMs : 0);
    return () => clearTimeout(timer);
  }, [text, long, delayMs]);
  const flush = useCallback(() => {
    if (long) setSettled(text);
  }, [long, text]);
  const state: SearchTermState = !text ? 'empty' : !long ? 'short' : settled === text ? 'ready' : 'waiting';
  const term = long ? settled : '';
  return useMemo(() => ({ term, state, flush }), [term, state, flush]);
}
