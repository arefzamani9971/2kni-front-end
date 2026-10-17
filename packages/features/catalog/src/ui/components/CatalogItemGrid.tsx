'use client';
import { memo, useMemo } from 'react';
import { DataGrid, PageState, type GridColumn } from '@dukani/ui-kit';
import type { CatalogItemSort, CatalogItemSummary } from '../../domain/catalog.types';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CatalogItemAction } from './CatalogItemAction';
import type { CatalogItemGridProps } from './CatalogItemGrid.types';
import { CatalogItemStatus } from './CatalogItemStatus';

const rowId = (item: CatalogItemSummary) => item.id;
const rowLabel = (item: CatalogItemSummary) => item.title;
const rowAction = (item: CatalogItemSummary) => <CatalogItemAction item={item} />;

/**
 * Catalog list CAT-13: desktop table 358:5348 with pager, mobile cards 358:485 with infinite scroll. Identity
 * (type, brand, distinguishing attributes, base unit) sits in one description so similar items can be told apart.
 */
export const CatalogItemGrid = memo(function CatalogItemGrid({ source, actions }: CatalogItemGridProps) {
  const t = useCatalogTexts();
  const columns = useMemo<readonly GridColumn<CatalogItemSummary, CatalogItemSort>[]>(
    () => [
      { id: 'title', header: t('name'), card: 'title', sortField: 'title', width: 'lg', cell: rowLabel },
      {
        id: 'description',
        header: t('description'),
        // a full-width line under the title on the card, like the subtitle of the previous row
        card: 'status',
        cell: (item) =>
          [item.productTypeName, item.brandName, item.keyAttributes, item.baseUnitName]
            .filter(Boolean)
            .join(' · '),
      },
      {
        id: 'status',
        header: t('publicInfo'),
        card: 'status',
        cell: (item) => <CatalogItemStatus item={item} />,
      },
    ],
    [t],
  );
  return (
    <DataGrid
      desktopVariant="table"
      source={source}
      columns={columns}
      getRowId={rowId}
      getRowLabel={rowLabel}
      label={t('catalog')}
      unit={t('itemUnit')}
      rowActions={actions ? rowAction : undefined}
      empty={<PageState kind="empty" title={t('empty')} />}
    />
  );
});
