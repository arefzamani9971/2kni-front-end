import { decimal, normalizeTitle, parseBarcode, parseDecimalInput, type DecimalString } from '@dukani/domain';
import type { Packaging } from './entry-draft.types';
import type { PackRow, PackRowError } from './pack-rows.types';

export const PACK_NAME_MAX = 80;
export const PACK_BASE_QTY_MAX = '1000000000';

/**
 * Checks the package rows of a new item like the server does (F12 §5, §11): a name of 1–80 letters that no other
 * active unit of the item (the base one included) has after normalization, a size above zero and up to 10⁹ with no
 * more decimals than the base unit allows (a count unit takes whole numbers), a valid barcode, and one use at least.
 */
export function checkPackRows(
  rows: readonly PackRow[],
  baseUnitName: string,
  baseUnitMaxDecimals: number,
): { errors: (PackRowError | undefined)[]; packs: Packaging[] | null } {
  const taken = new Set([normalizeTitle(baseUnitName)]);
  const packs: Packaging[] = [];
  const errors = rows.map((r): PackRowError | undefined => {
    const name = r.name.trim();
    if (!name || name.length > PACK_NAME_MAX) return 'name';
    const normalized = normalizeTitle(name);
    if (taken.has(normalized)) return 'duplicate';
    taken.add(normalized);
    const qty = parseDecimalInput(r.baseQty, { maxDecimals: Math.min(3, baseUnitMaxDecimals) });
    if (!qty.ok || !decimal.isPositive(qty.value) || decimal.gt(qty.value, decimal.of(PACK_BASE_QTY_MAX)))
      return 'quantity';
    const barcode = r.barcode?.trim() ? parseBarcode(r.barcode) : null;
    if (barcode && !barcode.ok) return 'barcode';
    const isSellable = r.isSellable ?? true;
    const isPurchasable = r.isPurchasable ?? true;
    if (!isSellable && !isPurchasable) return 'uses';
    packs.push({
      name,
      baseQty: qty.value as DecimalString,
      barcode: barcode?.ok ? barcode.value : undefined,
      isSellable,
      isPurchasable,
    });
    return undefined;
  });
  return { errors, packs: errors.some(Boolean) ? null : packs };
}
