'use client';
import { useEffect, useState, type ReactNode } from 'react';

let started: Promise<unknown> | null = null;

/**
 * In mock mode (NEXT_PUBLIC_API_MODE=mock) starts the MSW mock backend before the app renders,
 * so the first request is already intercepted. In live builds the import is dead code.
 */
export function MockApiBoundary({ enabled, fallback = null, children }: { enabled: boolean; fallback?: ReactNode; children: ReactNode }) {
  const [ready, setReady] = useState(!enabled);
  useEffect(() => {
    if (!enabled) return;
    started ??= import('@dukani/testing/browser').then((m) => m.startMockApi());
    let alive = true;
    started.then(
      () => alive && setReady(true),
      (e: unknown) => {
        console.error('[dukani] mock API failed to start', e);
        if (alive) setReady(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [enabled]);
  return <>{ready ? children : fallback}</>;
}
