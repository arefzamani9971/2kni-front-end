'use client';
import {
  Badge,
  DataGrid,
  PageState,
  type GridColumn,
  type GridSource,
  type SelectionStore,
} from '@dukani/ui-kit';
import { memo, useMemo } from 'react';
import type { ProductPageRow, ProductPageSort } from '../../domain/product-page.types';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

const rowId = (row: ProductPageRow) => row.id;
const rowLabel = (row: ProductPageRow) => row.title;
const selectable = (row: ProductPageRow) => !row.hasStockHistory;

/**
 * opening-pick table (1255:61 desktop, 1255:141 mobile cards): name, barcode, stock, sale price and readiness.
 * The shared grid pages on the server (desktop pager, mobile infinite cards); «select all» covers the visible page;
 * a product with stock history is shown but cannot be chosen.
 */
export const OpeningPickGrid = memo(function OpeningPickGrid({
  source,
  selection,
}: {
  source: GridSource<ProductPageRow, ProductPageSort>;
  selection: SelectionStore;
}) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  const columns = useMemo<readonly GridColumn<ProductPageRow, ProductPageSort>[]>(
    () => [
      {
        id: 'title',
        header: t('opening.columnName'),
        card: 'title',
        sortField: 'title',
        cell: (row) => row.title,
      },
      {
        id: 'barcode',
        header: t('opening.columnBarcode'),
        cell: (row) => <bdi dir="ltr">{row.barcode ?? '—'}</bdi>,
      },
      {
        id: 'onHand',
        header: t('opening.columnOnHand'),
        align: 'end',
        sortField: 'onHand',
        cell: (row) => `${presentation.qty(row.onHand)} ${row.baseUnitName}`,
      },
      {
        id: 'price',
        header: t('opening.columnPrice'),
        align: 'end',
        cell: (row) => (row.salePrice ? presentation.money(row.salePrice) : t('receipt.noPrice')),
      },
      {
        id: 'status',
        header: t('opening.columnStatus'),
        card: 'status',
        cell: (row) =>
          row.hasStockHistory ? (
            <Badge tone="warning">{t('opening.statusHistory')}</Badge>
          ) : (
            <Badge tone="success">{t('opening.statusReady')}</Badge>
          ),
      },
    ],
    [t, presentation],
  );
  return (
    <DataGrid
      source={source}
      selection={selection}
      isRowSelectable={selectable}
      columns={columns}
      getRowId={rowId}
      getRowLabel={rowLabel}
      label={t('opening.pickTitle')}
      unit={t('opening.unit')}
      empty={<PageState kind="empty" title={t('opening.empty')} />}
    />
  );
});
