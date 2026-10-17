import { isUuid } from '@dukani/domain';
import { CATALOG_FILTER_DEFAULTS, CATALOG_SEARCH_MAX_LENGTH } from './catalog-list.constants';
import type { CatalogItemFilter } from './catalog.types';

export const isCatalogSearchTooLong = (q: string) => q.trim().length > CATALOG_SEARCH_MAX_LENGTH;

/** Applied filter read from the URL; a value the endpoint would reject falls back to its default. */
export const catalogListFilter = (q: string, productTypeId: string): CatalogItemFilter => ({
  q: isCatalogSearchTooLong(q) ? CATALOG_FILTER_DEFAULTS.q : q.trim(),
  productTypeId: isUuid(productTypeId) ? productTypeId : CATALOG_FILTER_DEFAULTS.productTypeId,
});
