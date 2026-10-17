'use client';
import type { CatalogItemSummary } from '../../domain/catalog.types';
import { useCatalogTexts } from '../i18n/use-catalog-translations';

/**
 * Catalog status and the store link (F07 §5, §7): an item already in this store says so; any other row carries
 * only public information, never another store's price or stock.
 */
export function CatalogItemStatus({ item }: { item: CatalogItemSummary }) {
  const t = useCatalogTexts();
  return (
    <span className="flex flex-wrap gap-x-1">
      <span>{t(`status.${item.status}`)} ·</span>
      <span className={item.myStoreProductId ? 'text-fg-secondary' : 'text-warning'}>
        {t(item.myStoreProductId ? 'inMyStore' : 'noPriceStock')}
      </span>
    </span>
  );
}
