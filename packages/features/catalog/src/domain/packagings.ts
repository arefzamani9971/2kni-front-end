import { decimal, normalizeTitle, parseDecimalInput } from '@dukani/domain';

type PackagingInput = { readonly name: string; readonly baseQty: string };

/** Catalog packages follow both the unit precision and the catalog's three-decimal limit. */
export function validPackagings(rows: readonly PackagingInput[], unitMaxDecimals: number): boolean {
  if (rows.length > 10) return false;
  const names = new Set<string>();
  return rows.every(({ name, baseQty }) => {
    const normalized = normalizeTitle(name);
    if (!normalized || name.trim().length > 80 || names.has(normalized)) return false;
    names.add(normalized);
    const parsed = parseDecimalInput(baseQty, { maxDecimals: Math.min(3, unitMaxDecimals) });
    return (
      parsed.ok && decimal.isPositive(parsed.value) && !decimal.gt(parsed.value, decimal.of('1000000000'))
    );
  });
}
