import type { CatalogItemSummary } from '../../domain/catalog.types';

/** Opening one catalog row into the entry flow: one at a time, failure shown above the list. */
export type CatalogItemOpening = {
  readonly openingId: string | null;
  readonly failed: boolean;
  readonly open: (item: CatalogItemSummary) => void;
};
