import type { SortRule } from '@dukani/domain';
import type { CatalogItemFilter, CatalogItemSort } from './catalog.types';

/** Longest search text of `CatalogItemPageQuery.Q` (F07-S02: 120 is sent, 121 is invalid). */
export const CATALOG_SEARCH_MAX_LENGTH = 120;

/** Nothing hidden: the store's own and every allowed catalog item (F07 §3). */
export const CATALOG_FILTER_DEFAULTS: CatalogItemFilter = { q: '', productTypeId: null };

/** The endpoint's own order, shown on the title header from the start. */
export const CATALOG_LIST_SORT: readonly SortRule<CatalogItemSort>[] = [{ field: 'title', direction: 'asc' }];
