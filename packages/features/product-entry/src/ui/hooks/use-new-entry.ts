'use client';
import { useEffect, useRef, useState } from 'react';
import { useCan } from '@dukani/platform';
import { useStartEntry } from './use-start-entry';

/** One local draft per mount, including React Strict Mode's repeated effect setup. */
export function useNewEntry(purchaseHostId?: string) {
  const can = useCan('product.manage');
  const { startNew } = useStartEntry({ purchaseHostId, replace: true });
  const started = useRef(false);
  const [failed, setFailed] = useState(false);
  const start = () => {
    if (!can || started.current) return;
    started.current = true;
    setFailed(false);
    void startNew().catch(() => {
      started.current = false;
      setFailed(true);
    });
  };
  useEffect(start, [can]); // eslint-disable-line react-hooks/exhaustive-deps -- start only once per mounted store/host
  return { can, failed, retry: start };
}
