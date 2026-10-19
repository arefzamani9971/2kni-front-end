'use client';
import { useFormAutosave, useLocalizedAppForm, useValidationRules } from '@dukani/forms';
import { useCan } from '@dukani/platform';
import { Alert } from '@dukani/ui-kit';
import { entrySelectionOf } from '../../../domain/entry-selection';
import { useStartFromSelection } from '../hooks/use-start-from-selection';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { CatalogItemSummary } from './CatalogItemSummary';
import { selectionSchema } from '../schemas/CatalogSelectionEditor.schema';
import type { CatalogSelectionEditorProps } from '../types/CatalogSelectionEditor.types';
import { SelectionActions } from './SelectionActions';
import { SelectionExistingProduct } from './SelectionExistingProduct';
import { SelectionLocalFields } from './SelectionLocalFields';
import { SelectionShell } from './SelectionShell';

/**
 * A chosen catalog item before the entry starts (F07 «انتخاب کالای کاتالوگ», Figma 312:348 / 312:8837). The name and
 * note follow the form through `useFormAutosave` (PAT-FORM-01): typing re-renders the field only, the first change
 * of a burst is saved at once and the rest once, and the start waits for the latest input to be saved. Mounted
 * after the draft is read, so the form starts from what was saved.
 */
export function CatalogSelectionEditor({
  item,
  product,
  productId,
  draft,
  bulk,
  shell,
}: CatalogSelectionEditorProps) {
  const t = useEntryTranslations();
  const can = useCan('product.manage');
  const validationRules = useValidationRules();
  const form = useLocalizedAppForm({
    schema: selectionSchema(t, validationRules),
    defaultValues: { localTitle: draft.initial.localTitle, localNote: draft.initial.localNote },
  });
  const autosave = useFormAutosave(form, { select: entrySelectionOf, save: draft.save });
  const start = useStartFromSelection(bulk);
  const archived = item.status === 'Archived' || product?.status === 'Archived';
  const allowed = can && item.status !== 'Archived' && (!productId || product?.status === 'Active');
  const submit = form.handleSubmit(async (values) => {
    if (!allowed) return;
    await start.run({
      catalogItemId: item.id,
      storeProductId: productId ?? item.myStoreProductId ?? null,
      selection: entrySelectionOf(values),
      persist: autosave.flush,
    });
  });
  return (
    <SelectionShell
      {...shell}
      actions={
        <SelectionActions
          bulk={bulk}
          allowed={allowed}
          busy={start.busy}
          onContinue={() => void submit()}
          onBack={shell.onBack}
        />
      }
    >
      {start.failed ? <Alert tone="danger" title={t('startFailed')} /> : null}
      {draft.failed ? <Alert tone="warning" title={t('draftSaveFailed')} /> : null}
      {archived ? <Alert title={t('archivedSelection')} /> : null}
      <div className="desktop:grid-cols-2 desktop:gap-6 grid gap-4">
        <CatalogItemSummary item={item} />
        {productId ? (
          <SelectionExistingProduct product={product} />
        ) : (
          <form noValidate onSubmit={submit} className="contents">
            <SelectionLocalFields form={form} catalogTitle={item.title} />
          </form>
        )}
      </div>
    </SelectionShell>
  );
}
