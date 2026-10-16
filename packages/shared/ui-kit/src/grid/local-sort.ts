import type { SortRule } from '@dukani/domain';

const collator = new Intl.Collator('fa', { numeric: true, sensitivity: 'base' });
const missing = (value: unknown) => value === null || value === undefined || value === '';

/** Stable multi-rule sort of an in-memory list: Persian collation for text, numeric for numbers, empty last. */
export function sortRows<T, S extends string>(
  items: readonly T[],
  sort: readonly SortRule<S>[],
  sortValue: ((row: T, field: S) => string | number | null | undefined) | undefined,
): readonly T[] {
  if (!sortValue || !sort.length) return items;
  return [...items].sort((a, b) => {
    for (const rule of sort) {
      const x = sortValue(a, rule.field);
      const y = sortValue(b, rule.field);
      if (missing(x) || missing(y)) {
        if (missing(x) && missing(y)) continue;
        return missing(x) ? 1 : -1;
      }
      const order =
        typeof x === 'number' && typeof y === 'number' ? x - y : collator.compare(String(x), String(y));
      if (order) return rule.direction === 'desc' ? -order : order;
    }
    return 0;
  });
}
