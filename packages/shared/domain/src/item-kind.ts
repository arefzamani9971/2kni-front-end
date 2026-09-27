/** An item of a store is either goods (has stock) or a service (no stock) — BIZ-SRV-01. */
export type ItemKind = 'Goods' | 'Service';

export const ITEM_KIND_LABELS: Record<ItemKind, string> = { Goods: 'کالا', Service: 'خدمت' };

export const tracksStock = (kind: ItemKind): boolean => kind === 'Goods';
