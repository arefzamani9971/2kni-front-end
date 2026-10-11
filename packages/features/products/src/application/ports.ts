import type { CursorPage, Dto } from '@dukani/contracts';
import type { ProductFilter } from '../domain/product.types';
import type { ShortcutConfiguration, ShortcutItem } from '../domain/shortcut.types';

/** Port to the Inventory registry (products) and stock ledger (movements). */
export type ProductRepository = {
  shortcuts(storeId: string, signal?: AbortSignal): Promise<ShortcutConfiguration>;
  replaceShortcuts(
    storeId: string,
    expectedVersion: string,
    items: readonly ShortcutItem[],
  ): Promise<ShortcutConfiguration>;
  list(
    storeId: string,
    filter: ProductFilter,
    cursor: string | null,
    signal?: AbortSignal,
  ): Promise<CursorPage<Dto<'StoreProductSummaryDto'>>>;
  get(storeId: string, productId: string, signal?: AbortSignal): Promise<Dto<'StoreProductDto'>>;
  movements(
    storeId: string,
    productId: string,
    signal?: AbortSignal,
  ): Promise<CursorPage<Dto<'StockMovementDto'>>>;
};
