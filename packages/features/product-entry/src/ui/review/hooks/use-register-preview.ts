'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { entryUnitsOf, toRegisterRequest } from '../../../domain/entry-draft';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { stockUnitAvailable } from '../../../domain/stock-unit';
import { useProductEntryModule } from '../../../module';
import { entryKeys } from '../../common/state/entry-keys';

/**
 * The server preview of a reviewed entry (the register's own rules and warnings). A stock unit the draft no longer
 * offers is chosen again first (F12 AC07), so nothing is previewed until then.
 */
export function useRegisterPreview(draft: EntryDraft) {
  const { commands } = useProductEntryModule();
  const store = useActiveStore();
  const unitStale = draft.intent !== 'standalone' && !stockUnitAvailable(draft, entryUnitsOf(draft));
  const preview = useAppQuery({
    queryKey: entryKeys(store.id).custom('preview', draft.id, toRegisterRequest(draft)),
    queryFn: () => commands.preview(store.id, draft),
    enabled: !unitStale,
  });
  return { preview, unitStale };
}
