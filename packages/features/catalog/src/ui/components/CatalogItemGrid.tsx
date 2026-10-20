'use client';
import { memo } from 'react';
import { DataGrid, PageState, useGridColumns } from '@dukani/ui-kit';
import type { CatalogItemSort, CatalogItemSummary } from '../../domain/catalog.types';
import { CATALOG_ITEM_COLUMNS } from '../constants/catalog-item-columns.constants';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import type { CatalogHeaderKey, CatalogItemColumnId } from '../types/catalog-item-columns.types';
import { CatalogItemAction } from './CatalogItemAction';
import type { CatalogItemGridProps } from './CatalogItemGrid.types';
import { CatalogItemStatus } from './CatalogItemStatus';

const rowId = (item: CatalogItemSummary) => item.id;
const rowLabel = (item: CatalogItemSummary) => item.title;
const rowAction = (item: CatalogItemSummary) => <CatalogItemAction item={item} />;

// Cells read only the row, so the renderer stays at module scope and the columns follow the translator alone.
const renderCell = (item: CatalogItemSummary, id: CatalogItemColumnId) => {
  switch (id) {
    case 'title':
      return item.title;
    case 'description':
      return [item.productTypeName, item.brandName, item.keyAttributes, item.baseUnitName]
        .filter(Boolean)
        .join(' · ');
    case 'status':
      return <CatalogItemStatus item={item} />;
  }
};

/**
 * Catalog list CAT-13: desktop table 358:5348 with pager, mobile cards 358:485 with infinite scroll. Identity
 * (type, brand, distinguishing attributes, base unit) sits in one description so similar items can be told apart.
 */
export const CatalogItemGrid = memo(function CatalogItemGrid({ source, actions }: CatalogItemGridProps) {
  const t = useCatalogTexts();
  const columns = useGridColumns<CatalogItemSummary, CatalogItemColumnId, CatalogHeaderKey, CatalogItemSort>({
    definitions: CATALOG_ITEM_COLUMNS,
    translate: t,
    renderCell,
  });
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
