'use client';
import { useActiveStore } from '@dukani/platform';
import { PageShell } from '@dukani/ui-kit';
import type { ComponentProps } from 'react';

/** Page 17 frame for purchasing: App Bar with back (list, totals, detail) or title + store subtitle (new). */
export function PurchasingShell(props: Omit<ComponentProps<typeof PageShell>, 'subtitle'>) {
  const store = useActiveStore();
  return <PageShell subtitle={`دکانی · ${store.name}`} {...props} />;
}
