'use client';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';

import { useDebounced } from '@dukani/platform';
import { Overlay, PageState, ProductDataRow, SearchField } from '@dukani/ui-kit';
import { useState } from 'react';
import { useProductSearch } from '../hooks/use-product-search';

/** Picker for a receipt line's store product (search by name or code): sheet on mobile, dialog on desktop. */
export function ProductPicker({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (productId: string) => void;
}) {
  const t = usePurchaseTranslations();

  const presentation = usePurchasePresentation();
  const [q, setQ] = useState('');
  const debounced = useDebounced(q.trim(), 300);
  const result = useProductSearch(debounced, open);
  return (
    <Overlay open={open} onOpenChange={onOpenChange} title={t('chooseProduct')} size="full">
      <div className="flex flex-col gap-3">
        <SearchField label={t('searchProducts')} hideLabel value={q} onChange={setQ} autoFocus />
        {result.isPending ? <PageState kind="loading" rows={3} /> : null}
        {result.data?.length === 0 ? (
          <PageState kind="empty" title={t('noProducts')} description={t('newProductHint')} />
        ) : null}
        {result.data?.map((p) => (
          <ProductDataRow
            key={p.id}
            title={p.title}
            meta={[
              `${presentation.qty(p.available)} ${p.baseUnitName}`,
              p.salePriceAmount === null ? null : presentation.toman(p.salePriceAmount),
            ]
              .filter(Boolean)
              .join(' · ')}
            onClick={() => {
              onPick(p.id);
              onOpenChange(false);
            }}
          />
        ))}
      </div>
    </Overlay>
  );
}
