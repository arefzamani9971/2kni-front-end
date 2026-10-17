'use client';
import { useEffect } from 'react';
import type { Dto } from '@dukani/contracts';
import { ConfirmDialog, useConfirmAction } from '@dukani/ui-kit';
import { useLocalEdit } from '../hooks/use-local-edit';
import { useProductTranslations } from '../i18n/use-product-translations';
import { LocalEditBanner } from './LocalEditBanner';
import { LocalInfoForm } from './LocalInfoForm';

/** The local edit of a loaded, active product: save with version, recovery banner and the dirty-leave question. */
export function LocalEditor({ product, onDone }: { product: Dto<'StoreProductDto'>; onDone: () => void }) {
  const t = useProductTranslations();
  const edit = useLocalEdit(product);
  // leaving discards the unsaved edit once, however often «خروج» is pressed
  const leave = useConfirmAction(async () => onDone());
  useEffect(() => {
    if (edit.state.kind === 'saved') onDone();
  }, [edit.state.kind, onDone]);
  return (
    <>
      <LocalInfoForm
        open
        product={product}
        busy={edit.saving}
        banner={<LocalEditBanner state={edit.state} />}
        onSave={edit.save}
        onBack={(dirty) => (dirty ? leave.open() : onDone())}
      />
      <ConfirmDialog
        {...leave.dialog}
        title={t('local.leaveTitle')}
        description={t('local.leaveHint')}
        confirmLabel={t('local.leave')}
        cancelLabel={t('local.stay')}
        destructive
      />
    </>
  );
}
