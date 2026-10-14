'use client';
import { useState } from 'react';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import type { AttachmentFilter } from '../../domain/catalog-attachment.types';
import { useProductEntryModule } from '../../module';

export function useAttachmentSearch() {
  const { id: storeId } = useActiveStore();
  const { attachments, catalog } = useProductEntryModule();
  const [filters, setFilters] = useState<AttachmentFilter>({ q: '', onlyNotInMyStore: true, limit: 20 });
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const [page, setPage] = useState(0);
  const query = { ...filters, cursor: cursors[page] };
  const results = useAppQuery({
    queryKey: ['catalog-attachment-candidates', storeId, query],
    queryFn: ({ signal }) => attachments.search(storeId, query, signal),
  });
  const categories = useAppQuery({
    queryKey: ['entry-categories', storeId],
    queryFn: ({ signal }) => catalog.categories(storeId, signal),
  });
  const types = useAppQuery({
    queryKey: ['entry-product-types', storeId],
    queryFn: ({ signal }) => catalog.productTypes(storeId, signal),
  });
  return {
    results,
    categories,
    types,
    query,
    page,
    change: (next: Partial<AttachmentFilter>) => {
      setFilters((old) => ({ ...old, ...next }));
      setCursors([undefined]);
      setPage(0);
    },
    next: () => {
      const cursor = results.data?.nextCursor;
      if (cursor) {
        setCursors((old) => [...old.slice(0, page + 1), cursor]);
        setPage(page + 1);
      }
    },
    previous: () => setPage(Math.max(0, page - 1)),
    snapshot: () => attachments.snapshot(storeId, { ...filters, cursor: null }),
  };
}
