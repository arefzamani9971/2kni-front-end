'use client';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';

import { useActiveStore, useCan, useDebounced } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, Overlay, PageState, ProductDataRow, SearchField } from '@dukani/ui-kit';
import { useState } from 'react';
import { useProductSearch } from '../hooks/use-product-search';

/** Picker for a receipt line's store product (search by name or code): sheet on mobile, dialog on desktop. */
export function ProductPicker({
  open,
  onOpenChange,
  onPick,
  purchaseId,
  onCreate,
  busy = false,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (productId: string) => void;
  purchaseId?: string;
  onCreate?: () => void;
  busy?: boolean;
}) {
  const t = usePurchaseTranslations();
  const store = useActiveStore();
  const canCreate = useCan('product.manage');

  const presentation = usePurchasePresentation();
  const [q, setQ] = useState('');
  const debounced = useDebounced(q.trim(), 300);
  const result = useProductSearch(debounced, open);
  return (
    <Overlay open={open} onOpenChange={onOpenChange} title={t('chooseProduct')} size="full">
      <div className="flex flex-col gap-3">
        <SearchField label={t('searchProducts')} hideLabel value={q} onChange={setQ} autoFocus />
        {purchaseId && canCreate ? (
          <ButtonLink href={sellerRoutes.entry.new(store.id, purchaseId)}>
            {t('createMissingProduct')}
          </ButtonLink>
        ) : null}
        {!purchaseId && canCreate && onCreate ? (
          <Button loading={busy} onClick={onCreate}>
            {t('createMissingProduct')}
          </Button>
        ) : null}
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
