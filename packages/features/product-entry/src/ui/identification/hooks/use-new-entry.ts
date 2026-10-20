'use client';
import { useEffect, useRef, useState } from 'react';
import { useCan } from '@dukani/platform';
import { useStartEntry } from '../../common/hooks/use-start-entry';
import type { NewEntryHost } from '../types/use-new-entry.types';

/**
 * One local draft per mount, including React Strict Mode's repeated effect setup. A purchase host (a receipt draft
 * or the continuous purchase) gets the registered product back; a barcode that found nothing starts the new item.
 */
export function useNewEntry({ purchaseHostId, continuousHost = false, barcode }: NewEntryHost = {}) {
  const can = useCan('product.manage');
  const { startNew } = useStartEntry({ purchaseHostId, continuousHost, replace: true });
  const started = useRef(false);
  const [failed, setFailed] = useState(false);
  const start = () => {
    if (!can || started.current) return;
    started.current = true;
    setFailed(false);
    void startNew(barcode ? { barcode } : {}).catch(() => {
      started.current = false;
      setFailed(true);
    });
  };
  useEffect(start, [can]); // eslint-disable-line react-hooks/exhaustive-deps -- start only once per mounted store/host
  return { can, failed, retry: start };
}
