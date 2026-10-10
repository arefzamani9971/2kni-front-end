import { decimal, normalizeTitle, parseDecimalInput } from '@dukani/domain';

type PackagingInput = { readonly name: string; readonly baseQty: string };
export type PackagingRowIssue = {
  readonly name?: 'required' | 'tooLong' | 'duplicate';
  readonly baseQty?: 'invalid';
};
export type PackagingIssues = { readonly tooMany: boolean; readonly rows: readonly PackagingRowIssue[] };

export const MAX_PACKAGINGS = 10;

/** Catalog packages follow both the unit precision and the catalog's three-decimal limit; issues stay per row. */
export function packagingIssues(rows: readonly PackagingInput[], unitMaxDecimals: number): PackagingIssues {
  const names = new Set<string>();
  return {
    tooMany: rows.length > MAX_PACKAGINGS,
    rows: rows.map(({ name, baseQty }) => {
      const normalized = normalizeTitle(name);
      const nameIssue = !normalized
        ? 'required'
        : name.trim().length > 80
          ? 'tooLong'
          : names.has(normalized)
            ? 'duplicate'
            : undefined;
      names.add(normalized);
      const parsed = parseDecimalInput(baseQty, { maxDecimals: Math.min(3, unitMaxDecimals) });
      const qtyValid =
        parsed.ok && decimal.isPositive(parsed.value) && !decimal.gt(parsed.value, decimal.of('1000000000'));
      return {
        ...(nameIssue ? { name: nameIssue } : {}),
        ...(qtyValid ? {} : { baseQty: 'invalid' as const }),
      };
    }),
  };
}

export function validPackagings(rows: readonly PackagingInput[], unitMaxDecimals: number): boolean {
  const issues = packagingIssues(rows, unitMaxDecimals);
  return !issues.tooMany && issues.rows.every((row) => !row.name && !row.baseQty);
}
