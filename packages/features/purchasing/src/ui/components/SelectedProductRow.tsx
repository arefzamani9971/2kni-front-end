'use client';
import type { Dto } from '@dukani/contracts';
import { ProductDataRow } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

/** The product of the receipt with its current stock; the title shows at once while the detail loads. */
export function SelectedProductRow({ product, title }: { product?: Dto<'StoreProductDto'>; title?: string }) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  return (
    <ProductDataRow
      title={product?.title ?? title ?? ''}
      subtitle={
        product
          ? t('receipt.productStock', {
              quantity: presentation.qty(product.onHand),
              unit: product.baseUnitName,
            })
          : undefined
      }
    />
  );
}
