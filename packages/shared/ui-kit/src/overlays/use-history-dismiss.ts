'use client';
import { useEffect, useRef } from 'react';

/**
 * Lets the system Back close a full-screen layer instead of leaving the page (spec/front/autocomplete.md): while
 * open, one history entry (a copy of the router's state plus a marker) sits on top; Back pops it and closes the
 * layer; closing it otherwise removes that entry again. The entry is added a tick after opening so a development
 * double mount does not leave a stray one. A layer must not navigate in the same tick it closes.
 */
export function useHistoryDismiss(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const marker = Math.random().toString(36).slice(2);
    let pushed = false;
    const onPop = () => {
      if ((window.history.state as { dukaniLayer?: string } | null)?.dukaniLayer !== marker)
        closeRef.current();
    };
    const timer = window.setTimeout(() => {
      window.history.pushState({ ...(window.history.state as object | null), dukaniLayer: marker }, '');
      pushed = true;
      window.addEventListener('popstate', onPop);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('popstate', onPop);
      if (pushed && (window.history.state as { dukaniLayer?: string } | null)?.dukaniLayer === marker)
        window.history.back();
    };
  }, [open]);
}
