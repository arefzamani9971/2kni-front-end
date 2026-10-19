import type { EntryDraft, EntryUnit, StockEntry } from './entry-draft.types';
import { STOCK_UNIT_REFUSALS } from './stock-unit.constants';
import type { StockUnitChoice } from './stock-unit.types';

/** Whether an error is the server refusing the stock unit, which asks for a new choice instead of a retry. */
export const isStockUnitRefusal = (error: { readonly code: string } | null | undefined): boolean =>
  !!error && STOCK_UNIT_REFUSALS.has(error.code);

/** The draft's purchase unit matching the scanned barcode: the store unit when the scan names one, else the catalog unit. */
const scannedUnit = (d: EntryDraft, units: readonly EntryUnit[]): EntryUnit | undefined => {
  const scan = d.scanContext;
  if (!scan) return undefined;
  return scan.storeProductUnitId
    ? units.find((u) => u.storeProductUnitId === scan.storeProductUnitId)
    : units.find((u) => !!scan.catalogItemUnitId && u.catalogItemUnitId === scan.catalogItemUnitId);
};

/**
 * The unit the stock step starts with (F12 §6, §12): the one the draft already holds (raw editor first, then the
 * saved stock), else the scanned package, else the first purchase unit. A held or scanned unit that is not among
 * the purchase units starts empty with a notice, so the seller chooses again; it never turns silently into the base
 * or another unit (AC07, scenarios 14–15).
 */
export function initialStockUnit(
  d: EntryDraft,
  units: readonly EntryUnit[],
  kind: StockEntry['kind'],
): StockUnitChoice {
  const held =
    d.stockEditor?.kind === kind
      ? d.stockEditor.fields.unitKey
      : d.stock?.kind === kind
        ? d.stock.unitKey
        : undefined;
  const scanned = scannedUnit(d, units);
  const scanUnusable = !!d.scanContext && !scanned;
  if (held)
    return units.some((u) => u.key === held) ? { key: held, notice: null } : { key: '', notice: 'stale' };
  // an empty held unit is a choice still owed: after a scan that cannot be bought, or a stale unit cleared for reselection
  if (held === '') return { key: '', notice: scanUnusable ? 'scan' : 'stale' };
  if (scanned) return { key: scanned.key, notice: null };
  if (scanUnusable) return { key: '', notice: 'scan' };
  return { key: units[0]?.key ?? '', notice: null };
}

/** Whether the draft's stock names a unit the draft can still purchase in (else it has to be chosen again). */
export const stockUnitAvailable = (d: EntryDraft, units: readonly EntryUnit[]): boolean =>
  !d.stock || units.some((u) => u.key === d.stock!.unitKey);

/**
 * Prepares a draft whose stock unit the server refused (`ENTRY_UNIT_UNAVAILABLE`, `UNIT_NOT_PURCHASABLE`) for an
 * explicit new choice: the units read again (catalog drafts) replace the snapshot, the store product version is
 * the one just read, and the stock unit is cleared, never replaced by another unit.
 */
export const forStockUnitReselection = (
  d: EntryDraft,
  fresh: { readonly units: readonly EntryUnit[]; readonly storeProductVersion?: number } | null,
): EntryDraft => ({
  ...d,
  catalog:
    d.catalog && fresh
      ? {
          ...d.catalog,
          units: [...fresh.units],
          storeProductVersion: fresh.storeProductVersion ?? d.catalog.storeProductVersion,
        }
      : d.catalog,
  stock: d.stock ? { ...d.stock, unitKey: '' } : d.stock,
  stockEditor: d.stockEditor
    ? { ...d.stockEditor, fields: { ...d.stockEditor.fields, unitKey: '' } }
    : d.stockEditor,
  pending: undefined,
});
