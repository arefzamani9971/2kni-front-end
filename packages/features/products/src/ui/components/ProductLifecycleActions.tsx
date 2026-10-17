'use client';
import type { Dto } from '@dukani/contracts';
import { Alert, ConfirmDialog, FeatureAction, useAppErrorMessage, useConfirmAction } from '@dukani/ui-kit';
import { isArchived } from '../../domain/lifecycle';
import { useProductLifecycle } from '../hooks/use-product-lifecycle';
import { useProductTranslations } from '../i18n/use-product-translations';

/**
 * PRD-ARCHIVE (F11 §8): archive or restore with a confirmation that names the product and the effect. Shown as one
 * more action tile beside the Figma detail actions (312:1441). The confirmation runs the command once, stays open
 * while it runs, and keeps a failure (409 title conflict, unusable catalog item, stale version) on screen; the
 * product is read again first.
 */
export function ProductLifecycleActions({ product }: { product: Dto<'StoreProductDto'> }) {
  const t = useProductTranslations();
  const errorMessage = useAppErrorMessage();
  const run = useProductLifecycle(product);
  // the action chosen when the dialog opened, even if a re-read product flips the tile meanwhile
  const confirm = useConfirmAction(run);
  const action = isArchived(product) ? 'restore' : 'archive';
  const shown = confirm.target ?? action;
  return (
    <>
      <FeatureAction
        icon={action === 'restore' ? 'archive-restore' : 'archive'}
        label={t(`lifecycle.${action}`)}
        onClick={() => confirm.open(action)}
      />
      <ConfirmDialog
        {...confirm.dialog}
        title={t(`lifecycle.${shown}Title`, { title: product.title })}
        description={t(`lifecycle.${shown}Hint`)}
        confirmLabel={t(`lifecycle.${shown}`)}
        cancelLabel={t('lifecycle.cancel')}
        destructive={shown === 'archive'}
      >
        {confirm.error ? (
          <Alert tone="danger" title={t('lifecycle.failed')} description={errorMessage(confirm.error)} />
        ) : null}
      </ConfirmDialog>
    </>
  );
}
