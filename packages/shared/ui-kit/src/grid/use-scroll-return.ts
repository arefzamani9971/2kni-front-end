'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { onReturn, readAnchor, writeAnchor } from './scroll-return';
import type { ListAnchor } from './scroll-return.types';

/** An anchor that is not loaded yet is looked for again as more cards arrive, a few times. */
const RESTORE_ATTEMPTS = 3;

/**
 * Return context of a card list (details pattern, PAT-LIST-02): remembers the card at the top while the seller
 * scrolls and brings it back to the top when they return — Back/Forward or a reload, whether the list mounts again
 * or the router reveals it from its back cache (effects run again then). When that card is no longer loaded, the
 * nearest position is used. `anchor` and `scrollToAnchor` come from the virtualizer, after it attached.
 */
export function useScrollReturn(options: {
  readonly scroller: HTMLElement | null;
  readonly ready: boolean;
  readonly rowCount: number;
  readonly label: string;
  readonly anchor: () => ListAnchor | null;
  /** Scrolls to the anchor; true when its card is loaded (otherwise to the nearest loaded position). */
  readonly scrollToAnchor: (anchor: ListAnchor) => boolean;
}) {
  const { scroller, ready, rowCount, label } = options;
  const latest = useRef(options);
  useLayoutEffect(() => {
    latest.current = options;
  });
  const pending = useRef<ListAnchor | null>(null);
  const attempts = useRef(0);
  const apply = useRef(() => {
    const target = pending.current;
    const { ready: shown, rowCount: rows, scrollToAnchor } = latest.current;
    if (!target || !shown || rows === 0) return;
    attempts.current += 1;
    if (scrollToAnchor(target) || attempts.current >= RESTORE_ATTEMPTS) pending.current = null;
  });
  useLayoutEffect(() => {
    if (!ready) return;
    return onReturn(() => {
      pending.current = readAnchor(label);
      attempts.current = 0;
      apply.current();
    });
  }, [ready, label]);
  // more cards may bring the anchor in
  useLayoutEffect(() => apply.current(), [rowCount]);
  useEffect(() => {
    if (!ready) return;
    const save = () => writeAnchor(label, latest.current.anchor());
    const source: HTMLElement | Window = scroller ?? window;
    source.addEventListener('scroll', save, { passive: true });
    return () => source.removeEventListener('scroll', save);
  }, [ready, scroller, label]);
}
