import type { CursorPage, Dto } from '@dukani/contracts';
import type { ProductFilter } from '../domain/product';

/** Port to the Inventory registry (products) and stock ledger (movements). */
export type ProductRepository = {
  list(storeId: string, filter: ProductFilter, cursor: string | null, signal?: AbortSignal): Promise<CursorPage<Dto<'StoreProductSummaryDto'>>>;
  get(storeId: string, productId: string, signal?: AbortSignal): Promise<Dto<'StoreProductDto'>>;
  movements(storeId: string, productId: string, signal?: AbortSignal): Promise<CursorPage<Dto<'StockMovementDto'>>>;
};
