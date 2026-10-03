import type { MyStores } from './store.types';

/**
 * Where a signed-in seller lands (F01 → F02): the default store, else the only store,
 * else the store list (which offers «ثبت فروشگاه»).
 */
export const entryStoreId = (my: MyStores, defaultStoreId: string | null): string | null => {
  if (defaultStoreId && my.stores.some((s) => s.id === defaultStoreId)) return defaultStoreId;
  return my.stores.length === 1 ? my.stores[0]!.id : null;
};
