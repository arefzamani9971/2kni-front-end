import type { CursorPage, Dto } from '@dukani/contracts';
import type { LocalInfoRequest } from '../domain/local-info.types';
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
  /** F11 local name/note/service cost; the body carries the edited version (409 when stale). */
  updateLocal(storeId: string, productId: string, body: LocalInfoRequest): Promise<Dto<'StoreProductDto'>>;
  /** F11 archive/restore; repeating the same action is a no-op on the server. */
  archive(storeId: string, productId: string, expectedVersion: number): Promise<Dto<'StoreProductDto'>>;
  restore(storeId: string, productId: string, expectedVersion: number): Promise<Dto<'StoreProductDto'>>;
  /** The store's catalog correction requests for one catalog item, newest first (detail status, F11 §7). */
  corrections(
    storeId: string,
    catalogItemId: string,
    signal?: AbortSignal,
  ): Promise<readonly Dto<'CorrectionRequestDto'>[]>;
};
