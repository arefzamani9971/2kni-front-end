import { sellerRoutes } from '@dukani/routes';
import { entryStoreId } from '@dukani/store';
import type { SellerContainer } from './container.types';

/**
 * Where a signed-in seller lands: the default store only while it is still one of theirs, the single store,
 * otherwise the store list (choose / create / invitations). Never auto-enters a store they lost (F01-S15).
 */
export const entryRoute = async (modules: SellerContainer['modules'], defaultStoreId: string | null | undefined) => {
  const my = await modules.store.stores.myStores().catch(() => null);
  const storeId = my ? entryStoreId(my, defaultStoreId ?? null) : null;
  return storeId ? sellerRoutes.store.home(storeId) : sellerRoutes.stores();
};
