'use client';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import type { Dto } from '@dukani/contracts';
import { Overlay, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import { fromLineDto } from '../../domain/purchase';
import type { LineDraft } from '../../domain/purchase.types';
import { LineEditor } from './LineEditor';
import { useStoreProduct } from '../common/hooks/use-store-product';

export function LineSheet({
  editing,
  purchase,
  onClose,
  onSave,
  busy,
}: {
  editing: { productId: string; index: number | null } | null;
  purchase: Dto<'PurchaseDto'>;
  onClose: () => void;
  onSave: (line: LineDraft) => Promise<void>;
  busy: boolean;
}) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();

  const product = useStoreProduct(editing?.productId ?? null);
  const initial =
    editing?.index != null
      ? fromLineDto(purchase.lines[editing.index]!, product.data?.baseUnitName)
      : undefined;
  return (
    <Overlay
      open={!!editing}
      onOpenChange={(o) => !o && onClose()}
      title={product.data?.title ?? t('line')}
      size="full"
    >
      {product.error ? (
        <PageState kind="error" description={errorMessage(product.error)} />
      ) : product.data ? (
        <LineEditor
          key={`${editing?.productId}-${editing?.index}`}
          product={product.data}
          initial={initial}
          submitLabel={t('saveLine')}
          onSubmit={onSave}
          busy={busy}
        />
      ) : (
        <PageState kind="loading" rows={2} />
      )}
    </Overlay>
  );
}
