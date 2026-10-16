'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { createKeyboardWedgeDetector } from './keyboard-wedge';
import type { KeyboardWedgeOptions } from './keyboard-wedge.types';

const isEditable = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.matches('input:not([type=checkbox]):not([type=radio]):not([type=button]), textarea, select'));

/**
 * Listens for a keyboard-wedge barcode scanner on the whole page (desktop sale/purchase): no button, no focused
 * field needed (PAT-SCAN-01). Keys typed into a text field are never taken — that field handles its own input, so a
 * customer name or an amount can't become a barcode. The scan's Enter is swallowed so it never presses a focused
 * button. One capture-phase listener; nothing re-renders until a code is recognised.
 */
export function useHardwareScanner(
  onScan: (code: string) => void,
  { enabled = true, ...options }: KeyboardWedgeOptions & { readonly enabled?: boolean } = {},
) {
  const latest = useRef(onScan);
  useLayoutEffect(() => {
    latest.current = onScan;
  });
  const { maxGapMs, minLength, maxLength } = options;
  useEffect(() => {
    if (!enabled) return;
    const detector = createKeyboardWedgeDetector({ maxGapMs, minLength, maxLength });
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditable(event.target)) {
        detector.reset();
        return;
      }
      const result = detector.feed(event);
      if (!result.consumed) return;
      event.preventDefault();
      event.stopPropagation();
      if (result.code) latest.current(result.code);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [enabled, maxGapMs, minLength, maxLength]);
}
