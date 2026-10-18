'use client';
import { useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import type { EntrySearchFilters } from '../../application/ports';
import { CatalogSelectionEditor } from '../components/CatalogSelectionEditor';
import { SelectionActions } from '../components/SelectionActions';
import { SelectionShell } from '../components/SelectionShell';
import { useCatalogSelection } from '../hooks/use-catalog-selection';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useSelectionDraft } from '../hooks/use-selection-draft';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/**
 * «انتخاب کالای کاتالوگ» (F07): reads the chosen item and the saved name and note, then hands them to the editor.
 * Until both are read (or when a read fails) the same frame shows the state with the start disabled.
 */
export function EntrySelectionScreen({
  query,
  itemId,
  productId,
  bulk = false,
  filters,
}: {
  query: string;
  itemId?: string;
  productId?: string;
  bulk?: boolean;
  filters?: EntrySearchFilters;
}) {
  const t = useEntryTranslations();
  const message = useAppErrorMessage();
  const store = useActiveStore();
  const go = useEntryNav();
  const selection = useCatalogSelection(itemId, productId);
  const draft = useSelectionDraft(selection.id);
  const [search, setSearch] = useState(query);
  const shell = {
    search,
    onSearchChange: setSearch,
    // a new search is a step forward: Back returns to this item with its typed name and note
    onSearch: () => go.nav.push(sellerRoutes.entry.search(store.id, search.trim(), bulk, filters)),
    onBack: () => go.nav.push(sellerRoutes.entry.search(store.id, query, bulk, filters)),
  };
  const error = selection.error ?? draft.error;
  if (selection.item && draft.initial && !error)
    return (
      <CatalogSelectionEditor
        key={selection.item.id}
        item={selection.item}
        product={selection.product}
        productId={productId}
        draft={{ initial: draft.initial, save: draft.save, failed: draft.failed }}
        bulk={bulk}
        shell={shell}
      />
    );
  return (
    <SelectionShell
      {...shell}
      actions={
        <SelectionActions
          bulk={bulk}
          allowed={false}
          busy={false}
          onContinue={() => {}}
          onBack={shell.onBack}
        />
      }
    >
      {error ? (
        <PageState
          kind="error"
          description={message(error)}
          action={
            <Button
              onClick={() => {
                selection.retry();
                if (draft.error) draft.retry();
              }}
            >
              {t('retry')}
            </Button>
          }
        />
      ) : (
        <PageState kind="loading" />
      )}
    </SelectionShell>
  );
}
