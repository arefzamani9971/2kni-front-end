'use client';
import { defaultRangeExtractor, useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useLayoutEffect, useState } from 'react';
import type { GridCardListProps } from './GridCardList.types';
import { CARD_ESTIMATE, CARD_OVERSCAN } from './DataGrid.constants';
import { scrollContainer } from './scroll-container';

/** Variable-height cards in the nearest scrolling container. The focused card stays mounted while scrolling. */
export function GridCardList<T>({ rows, label, busy, children }: GridCardListProps<T>) {
  'use no memo'; // TanStack Virtual exposes a mutable instance; compiler memoization would stale its range.
  const [element, setElement] = useState<HTMLUListElement | null>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const [margin, setMargin] = useState(0);
  const [focused, setFocused] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    if (!element) return;
    const scroller = scrollContainer(element);
    setScrollElement(scroller);
    setReady(true);
    const measure = () =>
      setMargin(
        scroller
          ? element.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
          : element.getBoundingClientRect().top + window.scrollY,
      );
    measure();
    const observer = new ResizeObserver(measure);
    if (scroller) observer.observe(scroller);
    if (element.parentElement) observer.observe(element.parentElement);
    return () => observer.disconnect();
  }, [element]);
  const focusedIndex = focused ? rows.findIndex((entry) => entry.id === focused) : -1;
  const getItemKey = useCallback((index: number) => rows[index]!.id, [rows]);
  const options = {
    count: rows.length,
    getItemKey,
    estimateSize: () => CARD_ESTIMATE,
    // Hidden/unmeasured cards must not collapse the whole list to zero height.
    measureElement: (card: HTMLLIElement) => card.getBoundingClientRect().height || CARD_ESTIMATE,
    overscan: CARD_OVERSCAN,
    scrollMargin: margin,
    useFlushSync: false,
    rangeExtractor: (range: Parameters<typeof defaultRangeExtractor>[0]) =>
      [...new Set([...defaultRangeExtractor(range), ...(focusedIndex >= 0 ? [focusedIndex] : [])])].sort(
        (a, b) => a - b,
      ),
  };
  const elementList = useVirtualizer({
    ...options,
    getScrollElement: () => scrollElement,
    enabled: ready && !!scrollElement,
  });
  const windowList = useWindowVirtualizer({ ...options, enabled: ready && !scrollElement });
  const windowed = scrollElement ? elementList : windowList;
  // Keep the virtual container even when its viewport is temporarily hidden or unmeasured.
  // Falling back to normal flow on an empty range changes its height and can reset scroll.
  const virtual = ready;
  const items = virtual
    ? windowed
        .getVirtualItems()
        .map((item) => ({ ...rows[item.index]!, index: item.index, start: item.start }))
    : rows.map((entry, index) => ({ ...entry, index, start: 0 }));
  return (
    <ul
      ref={setElement}
      aria-label={label}
      aria-busy={busy}
      className="relative flex flex-col gap-3"
      style={virtual ? { height: windowed.getTotalSize() } : undefined}
    >
      {items.map(({ id, row, index, start }) => (
        <li
          key={id}
          data-index={index}
          aria-posinset={index + 1}
          aria-setsize={rows.length}
          ref={virtual ? windowed.measureElement : undefined}
          className={virtual ? 'absolute inset-x-0 top-0 pb-3' : undefined}
          style={virtual ? { transform: `translateY(${start - margin}px)` } : undefined}
          onFocusCapture={() => setFocused(id)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null);
          }}
        >
          {children(row, id)}
        </li>
      ))}
    </ul>
  );
}
