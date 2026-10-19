import type { Dto } from '@dukani/contracts';
import { decimal } from '@dukani/domain';
import type { EntryUnit } from '../../../domain/entry-draft.types';

/**
 * Entry units of a catalog item (F12 §3, §6). A product already in the store is entered in its own store units: only
 * active purchase units, each with its own uses (a retired unit stays for history only). Otherwise every catalog unit
 * comes with its purchase and sale uses; the stock step keeps the purchase ones, pricing the sale packages.
 */
export const catalogEntryUnits = (
  item: Dto<'CatalogItemDto'>,
  existing: Dto<'StoreProductDto'> | null,
): EntryUnit[] =>
  existing
    ? existing.units
        .filter((u) => u.isPurchasable && !u.archivedAt)
        .map((u) => ({
          key: `store:${u.id}`,
          name: u.name,
          baseQty: decimal.of(u.baseQty),
          ...(u.catalogItemUnitId ? { catalogItemUnitId: u.catalogItemUnitId } : {}),
          storeProductUnitId: u.id,
          isPurchasable: true,
          isSellable: u.isSellable,
        }))
    : item.units.map((u) => ({
        key: u.kind === 'Base' ? 'base' : `unit:${u.id}`,
        name: u.name,
        baseQty: decimal.of(u.baseQty),
        catalogItemUnitId: u.id,
        isPurchasable: u.isPurchasable,
        isSellable: u.isSellable,
      }));
