'use client';
import { useRef, useState } from 'react';

/**
 * Keeps an IME composition (e.g. a Persian keyboard's predictive input) out of the query: while composing the
 * field shows its own text and the query is only told the result at `compositionend` (spec/front/autocomplete.md).
 */
export function useImeQuery(query: string, onQueryChange: (query: string) => void) {
  const composing = useRef(false);
  const [draft, setDraft] = useState<string | null>(null);
  return {
    value: draft ?? query,
    onChange: (value: string) => (composing.current ? setDraft(value) : onQueryChange(value)),
    compositionProps: {
      onCompositionStart: () => {
        composing.current = true;
      },
      onCompositionEnd: (event: { currentTarget: HTMLInputElement }) => {
        composing.current = false;
        setDraft(null);
        onQueryChange(event.currentTarget.value);
      },
    },
  };
}
