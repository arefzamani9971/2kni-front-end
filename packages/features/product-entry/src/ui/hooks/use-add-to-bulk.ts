'use client';
import { useRef, useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { addEntryToBulk } from '../../domain/bulk-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { useBulkDraft } from './use-bulk-draft';
import { useEntryNav } from './use-entry-nav';

/** «تأیید» of an entry opened from bulk entry: the reviewed item joins the bulk draft (once) and bulk entry opens. */
export function useAddToBulk(draft: EntryDraft) {
  const store = useActiveStore();
  const go = useEntryNav();
  const bulk = useBulkDraft(!!draft.bulkHost);
  const adding = useRef(false);
  const [error, setError] = useState<unknown>();
  const add = async () => {
    if (adding.current) return;
    adding.current = true;
    try {
      await bulk.update((d) => addEntryToBulk(d, draft));
      go.nav.push(sellerRoutes.entry.bulk(store.id));
    } catch (caught) {
      setError(caught);
    } finally {
      adding.current = false;
    }
  };
  return { add, error };
}
