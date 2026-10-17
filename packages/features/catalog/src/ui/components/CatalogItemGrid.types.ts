import type { GridSource } from '@dukani/ui-kit';
import type { CatalogItemSort, CatalogItemSummary } from '../../domain/catalog.types';

export type CatalogItemGridProps = {
  readonly source: GridSource<CatalogItemSummary, CatalogItemSort>;
  /** Row «جزئیات کاتالوگ» only for members who can start an entry (`product.manage`). */
  readonly actions: boolean;
};
