import type { CatalogCategory } from './catalog.types';

/** Preserve tree order while exposing descendants to selectors and grouped results. */
export function flattenCategories(rows: readonly CatalogCategory[]): CatalogCategory[] {
  return rows.flatMap((row) => [row, ...flattenCategories(row.children)]);
}

/** Only levels one and two can parent a new category in the three-level tree. */
export function categoryParents(rows: readonly CatalogCategory[], depth = 1): CatalogCategory[] {
  if (depth >= 3) return [];
  return rows.flatMap((row) =>
    row.status === 'Archived' ? [] : [row, ...categoryParents(row.children, depth + 1)],
  );
}
