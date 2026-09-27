import type { Dto } from '@dukani/contracts';

export type BusinessMode = Dto<'BusinessMode'>;

export const BUSINESS_MODE_LABELS: Record<BusinessMode, string> = {
  Retail: 'خرده‌فروشی',
  Wholesale: 'عمده‌فروشی',
  Both: 'هر دو',
};

/** ST02 helper text per store type key (what the type pre-configures). */
export const STORE_TYPE_HINTS: Readonly<Record<string, string>> = {
  stationery: 'دفتر، نوشت‌افزار، لوازم هنری',
  cosmetics: 'رنگ، حجم، نوع پوست و تاریخ',
  clothing: 'سایز، رنگ، جنس و فصل',
  supermarket: 'وزن، تاریخ مصرف و واحد فروش',
};

export const ROLE_LABELS: Record<Dto<'MemberRole'>, string> = { Owner: 'مالک', Staff: 'همکار' };

export type StoreListItem = {
  readonly id: string;
  readonly name: string;
  readonly typeName: string;
  readonly role: Dto<'MemberRole'>;
  readonly isDefault: boolean;
};

export type Invitation = { readonly id: string; readonly storeId: string; readonly storeName: string; readonly invitedBy: string | null };

export type MyStores = { readonly stores: readonly StoreListItem[]; readonly invitations: readonly Invitation[] };

/**
 * Where a signed-in seller lands (F01 → F02): the default store, else the only store,
 * else the store list (which offers «ثبت فروشگاه»).
 */
export const entryStoreId = (my: MyStores, defaultStoreId: string | null): string | null => {
  if (defaultStoreId && my.stores.some((s) => s.id === defaultStoreId)) return defaultStoreId;
  return my.stores.length === 1 ? my.stores[0]!.id : null;
};
