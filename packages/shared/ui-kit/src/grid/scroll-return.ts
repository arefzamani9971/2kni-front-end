/*
 * Return context of long card lists (PAT-LIST-02, details pattern: «anchor/loaded window» on mobile): the card at
 * the top of each address's list, restored only when the seller comes back to it (Back/Forward or a reload). A fresh
 * visit or a deep link starts at the top.
 */
import type { ListAnchor } from './scroll-return.types';

const PREFIX = 'dukani:list-anchor:';
/** A list shown this long after Back/Forward is a return to it; later ones are fresh visits. */
const RETURN_WINDOW_MS = 3000;
/**
 * The App Router may show the page returned to (from its back cache) a moment before `popstate` reaches us; a
 * list shown this shortly before Back/Forward is a return as well.
 */
const EARLY_SHOW_MS = 500;

let poppedAt = Number.NEGATIVE_INFINITY;
let reloadedHref: string | null = null;
let watching = false;
const waiting = new Set<() => void>();

/** Starts noticing Back/Forward once per document; a reload or history load of a list address counts too. */
export function watchReturns(): void {
  if (watching || typeof window === 'undefined') return;
  watching = true;
  window.addEventListener(
    'popstate',
    () => {
      if (waiting.size) {
        // a list was shown just before: this traversal is its return
        for (const resume of [...waiting]) resume();
        waiting.clear();
      } else poppedAt = performance.now();
    },
    { capture: true },
  );
  const entry = performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (entry?.type === 'reload' || entry?.type === 'back_forward') reloadedHref = entry.name;
}

/**
 * Calls `restore` once if the list being shown is a return: after a recent Back/Forward or a reload, or when one
 * follows within a moment. Each return is used by one list. Returns a cleanup.
 */
export function onReturn(restore: () => void): () => void {
  watchReturns();
  const popped = performance.now() - poppedAt < RETURN_WINDOW_MS;
  const reloaded = reloadedHref !== null && reloadedHref === window.location.href;
  poppedAt = Number.NEGATIVE_INFINITY;
  reloadedHref = null;
  if (popped || reloaded) {
    restore();
    return () => undefined;
  }
  waiting.add(restore);
  const expire = setTimeout(() => waiting.delete(restore), EARLY_SHOW_MS);
  return () => {
    clearTimeout(expire);
    waiting.delete(restore);
  };
}

const keyOf = (label: string) => `${PREFIX}${window.location.pathname}${window.location.search}#${label}`;

export function readAnchor(label: string): ListAnchor | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(keyOf(label)) ?? 'null') as Partial<ListAnchor> | null;
    return value && typeof value.id === 'string' && Number.isInteger(value.index) && value.index! >= 0
      ? { id: value.id, index: value.index! }
      : null;
  } catch {
    return null;
  }
}

export function writeAnchor(label: string, anchor: ListAnchor | null): void {
  try {
    if (anchor) sessionStorage.setItem(keyOf(label), JSON.stringify(anchor));
    else sessionStorage.removeItem(keyOf(label));
  } catch {
    // private mode or full storage: the list simply starts at the top next time
  }
}
