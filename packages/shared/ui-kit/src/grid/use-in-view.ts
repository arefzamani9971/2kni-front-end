'use client';
import { useEffect, useState } from 'react';
import { useHydrated } from '../responsive/use-hydrated';
import { scrollContainer } from './scroll-container';

/**
 * Whether an element is within `rootMargin` of its nearest scroll viewport (no scroll listeners).
 * `supported` is false on the server, during hydration and in browsers without the observer, so a visible
 * fallback («نمایش بیشتر») renders there.
 */
export function useInView<E extends Element>(rootMargin: string) {
  const hydrated = useHydrated();
  const supported = hydrated && typeof IntersectionObserver !== 'undefined';
  const [node, setNode] = useState<E | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!node || !supported) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      {
        root: scrollContainer(node),
        rootMargin,
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, rootMargin, supported]);
  return { ref: setNode, inView: supported && inView, supported };
}
