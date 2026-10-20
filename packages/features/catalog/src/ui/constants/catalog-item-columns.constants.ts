import type { GridColumnDefinition } from '@dukani/ui-kit';
import type { CatalogItemSort } from '../../domain/catalog.types';
import type { CatalogHeaderKey, CatalogItemColumnId } from '../types/catalog-item-columns.types';

/** Order, headers and card regions of the catalog list (CAT-13); cells are rendered by CatalogItemGrid. */
export const CATALOG_ITEM_COLUMNS = [
  { id: 'title', headerKey: 'name', card: 'title', sortField: 'title', width: 'lg' },
  // a full-width line under the title on the card, like the subtitle of the previous row
  { id: 'description', headerKey: 'description', card: 'status' },
  { id: 'status', headerKey: 'stateColumn', card: 'status' },
] as const satisfies readonly GridColumnDefinition<CatalogItemColumnId, CatalogHeaderKey, CatalogItemSort>[];
