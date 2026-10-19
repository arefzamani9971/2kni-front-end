import { decimal } from '@dukani/domain';
import type { EntryDraft, EntryUnit, UnitPrice } from './entry-draft.types';

/**
 * Packages a new store product can be sold in (F12 §7, §10): the sellable packagings of a new item, or the sellable
 * catalog packages when the store does not hold the item yet. An existing store product is priced on its own page.
 */
export const salePacksOf = (d: EntryDraft): EntryUnit[] => {
  if (d.catalog)
    return d.catalog.storeProductId
      ? []
      : d.catalog.units.filter((u) => u.key !== 'base' && u.isSellable === true);
  return (d.newItem?.packagings ?? []).flatMap((p, i) =>
    p.isSellable === false ? [] : [{ key: `pack:${i + 1}`, name: p.name, baseQty: p.baseQty }],
  );
};

const samePack = (price: Pick<UnitPrice, 'unitKey' | 'name' | 'baseQty'>, unit: EntryUnit) =>
  price.unitKey === unit.key && price.name === unit.name && decimal.eq(price.baseQty, unit.baseQty);

/** Saved explicit prices whose package is still the same one; a removed or changed package drops its price. */
export const unitPricesOf = (d: EntryDraft): UnitPrice[] => {
  const packs = salePacksOf(d);
  return (d.unitPrices ?? []).filter((price) => packs.some((unit) => samePack(price, unit)));
};
