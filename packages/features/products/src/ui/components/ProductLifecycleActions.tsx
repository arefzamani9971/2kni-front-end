'use client';
import { useState } from 'react';
import type { Dto } from '@dukani/contracts';
import { Alert, ConfirmDialog, FeatureAction, useAppErrorMessage } from '@dukani/ui-kit';
import { isArchived } from '../../domain/lifecycle';
import { useProductLifecycle } from '../hooks/use-product-lifecycle';
import { useProductTranslations } from '../i18n/use-product-translations';

/**
 * PRD-ARCHIVE (F11 §8): archive or restore with a confirmation that names the product and the effect. Shown as one
 * more action tile beside the Figma detail actions (312:1441). A failure (409 title conflict, unusable catalog item,
 * stale version) stays on screen; the product is read again first.
 */
export function ProductLifecycleActions({ product }: { product: Dto<'StoreProductDto'> }) {
  const t = useProductTranslations();
  const errorMessage = useAppErrorMessage();
  const lifecycle = useProductLifecycle(product);
  const [confirming, setConfirming] = useState(false);
  const archived = isArchived(product);
  const action = archived ? 'restore' : 'archive';
  return (
    <>
      <FeatureAction
        icon={archived ? 'archive-restore' : 'archive'}
        label={t(`lifecycle.${action}`)}
        onClick={() => {
          lifecycle.reset();
          setConfirming(true);
        }}
      />
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t(`lifecycle.${action}Title`, { title: product.title })}
        description={t(`lifecycle.${action}Hint`)}
        confirmLabel={t(`lifecycle.${action}`)}
        cancelLabel={t('lifecycle.cancel')}
        destructive={!archived}
        loading={lifecycle.pending}
        onConfirm={() => void lifecycle.run(action).then((ok) => ok && setConfirming(false))}
      >
        {lifecycle.error ? (
          <Alert tone="danger" title={t('lifecycle.failed')} description={errorMessage(lifecycle.error)} />
        ) : null}
      </ConfirmDialog>
    </>
  );
}
