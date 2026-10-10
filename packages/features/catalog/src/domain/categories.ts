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

/** Ancestor names from the root, so a flattened list still shows where a nested group sits. */
export function categoryPaths(rows: readonly CatalogCategory[]): ReadonlyMap<string, readonly string[]> {
  const paths = new Map<string, readonly string[]>();
  const walk = (level: readonly CatalogCategory[], parent: readonly string[]) => {
    for (const row of level) {
      const path = [...parent, row.name];
      paths.set(row.id, path);
      walk(row.children, path);
    }
  };
  walk(rows, []);
  return paths;
}
