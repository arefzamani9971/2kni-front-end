'use client';
import { TableAutocomplete, type AutocompleteColumn } from '@dukani/ui-kit';
import { useMemo } from 'react';
import type { ProductPageRow } from '../../../domain/product-page.types';
import { usePurchasePresentation } from '../../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';
import { useProductAutocomplete } from '../hooks/use-product-autocomplete';

/**
 * Product search of a receipt on the shared Table Autocomplete (columns کالا / بارکد / قیمت فروش on desktop, the
 * full-screen picker on mobile). A choice identifies the product only — no quantity, no line, no receipt.
 */
export function ProductAutocomplete({
  onSelect,
  disabled,
}: {
  onSelect: (row: ProductPageRow) => void;
  disabled?: boolean;
}) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  const search = useProductAutocomplete();
  const price = (row: ProductPageRow) =>
    row.salePrice ? presentation.money(row.salePrice) : t('receipt.noPrice');
  const columns = useMemo<readonly AutocompleteColumn<ProductPageRow>[]>(
    () => [
      {
        key: 'title',
        header: t('receipt.columnProduct'),
        render: (row) => row.title,
        width: 'minmax(0,2fr)',
      },
      {
        key: 'barcode',
        header: t('receipt.columnBarcode'),
        render: (row) => <bdi dir="ltr">{row.barcode ?? '—'}</bdi>,
      },
      { key: 'price', header: t('receipt.columnPrice'), render: price, align: 'end' },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- price follows t and presentation
    [t, presentation],
  );
  return (
    <TableAutocomplete<ProductPageRow>
      label={t('receipt.searchProduct')}
      placeholder={t('receipt.searchPlaceholder')}
      query={search.query}
      onQueryChange={search.setQuery}
      items={search.items}
      status={search.status}
      onRetry={search.retry}
      onSubmit={search.flush}
      getItemKey={(row) => row.id}
      getItemLabel={(row) => row.title}
      getOptionLabel={(row) =>
        t('receipt.optionLabel', { title: row.title, barcode: row.barcode ?? '—', price: price(row) })
      }
      columns={columns}
      onSelect={(row) => {
        search.setQuery('');
        onSelect(row);
      }}
      disabled={disabled}
    />
  );
}
