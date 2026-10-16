'use client';
import { useAppList, useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import type {
  AttachmentCandidate,
  AttachmentFilter,
  AttachmentSort,
} from '../../domain/catalog-attachment.types';
import { useProductEntryModule } from '../../module';
import { ATTACHMENT_FILTER_DEFAULTS } from './attachment-search.constants';

export function useAttachmentSearch() {
  const { id: storeId } = useActiveStore();
  const { attachments, catalog } = useProductEntryModule();
  const list = useAppList<AttachmentCandidate, AttachmentFilter, AttachmentSort>({
    queryKey: ['catalog-attachment-candidates', storeId],
    initialFilter: ATTACHMENT_FILTER_DEFAULTS,
    initialSort: [{ field: 'title', direction: 'asc' }],
    read: (query, { signal }) => attachments.search(storeId, query, signal),
  });
  const categories = useAppQuery({
    queryKey: ['entry-categories', storeId],
    queryFn: ({ signal }) => catalog.categories(storeId, signal),
  });
  const types = useAppQuery({
    queryKey: ['entry-product-types', storeId],
    queryFn: ({ signal }) => catalog.productTypes(storeId, signal),
  });
  return { list, categories, types, snapshot: () => attachments.snapshot(storeId, list.query.filter) };
}
