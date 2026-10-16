'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { appError } from '@dukani/domain';
import { selectAttachmentCandidates } from '../../domain/catalog-attachment';
import type { AttachmentDraft, AttachmentSelection } from '../../domain/catalog-attachment.types';
import type { AttachmentSelectionPanelProps } from '../components/AttachmentSelectionPanel.types';
import type { AttachmentCandidate } from '../../domain/catalog-attachment.types';
import type { AttachmentSelectionStore } from './attachment-selection-store.types';

/** A projection of the canonical draft cache, never an independently writable selection. */
export function useAttachmentSelection(
  state: AttachmentSelectionPanelProps['state'],
  rows: readonly AttachmentCandidate[],
  limitMessage: string,
) {
  const cache = useQueryCache();
  const { id: storeId } = useActiveStore();
  const latest = useRef({ state, rows, limitMessage });
  useLayoutEffect(() => {
    latest.current = { state, rows, limitMessage };
  });
  return useMemo(() => {
    const key = ['catalog-attachments-draft', storeId];
    let previous: AttachmentSelection[] | undefined;
    let byId = new Map<string, AttachmentSelection>();
    let ids: ReadonlySet<string> = new Set();
    const read = () => {
      const selections = cache.get<AttachmentDraft>(key)?.selections;
      if (selections !== previous) {
        previous = selections;
        byId = new Map(selections?.map((entry) => [entry.row.catalogItemId, entry]));
        if (ids.size !== byId.size || [...ids].some((id) => !byId.has(id))) ids = new Set(byId.keys());
      }
      return byId;
    };
    const candidates = new Map<string, AttachmentCandidate>();
    const remember = (values: readonly AttachmentCandidate[]) => {
      for (const candidate of values) candidates.set(candidate.item.id, candidate);
    };
    const setMany = (values: readonly string[], selected: boolean) => {
      if (latest.current.state.busy) return;
      remember(latest.current.rows);
      latest.current.state.edit((draft) => {
        const wanted = new Set(values);
        const selections = selected
          ? selectAttachmentCandidates(
              draft.selections,
              values.map((id) => candidates.get(id)).filter((row): row is AttachmentCandidate => !!row),
            )
          : draft.selections.filter((entry) => !wanted.has(entry.row.catalogItemId));
        if (selections.length > 1000)
          throw appError('Validation', 'VALIDATION_FAILED', latest.current.limitMessage);
        return { ...draft, selections, chunks: [] };
      });
    };
    const selection: AttachmentSelectionStore = {
      get: (id) => read().get(id),
      has: (id) => read().has(id),
      size: () => read().size,
      ids: () => {
        read();
        return ids;
      },
      set: (id, checked) => setMany([id], checked),
      toggle: (id) => setMany([id], !read().has(id)),
      setMany,
      clear: () => setMany([...read().keys()], false),
      subscribe: (listener) => cache.subscribe(key, listener),
    };
    return { selection, remember };
  }, [cache, storeId]);
}
