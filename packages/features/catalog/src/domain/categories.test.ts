import { describe, expect, it } from 'vitest';
import { categoryParents, flattenCategories } from './categories';
import type { CatalogCategory } from './catalog.types';
const category = (id: string, children: CatalogCategory[] = []): CatalogCategory => ({
  id,
  name: id,
  parentId: null,
  sort: 0,
  status: 'Public',
  productCount: 0,
  productTypeCount: 0,
  children,
});
describe('category tree projection', () => {
  it('keeps third-level nodes and sibling order without changing the tree', () => {
    const tree = [
      category('root', [category('child', [category('leaf')]), category('sibling')]),
      category('other'),
    ];
    expect(flattenCategories(tree).map((row) => row.id)).toEqual([
      'root',
      'child',
      'leaf',
      'sibling',
      'other',
    ]);
    expect(tree[0]?.children).toHaveLength(2);
  });
  it('handles an empty tree', () => expect(flattenCategories([])).toEqual([]));
  it('offers only active parents with space for a child within three levels', () => {
    const archived = { ...category('archived', [category('hidden')]), status: 'Archived' as const };
    const tree = [category('root', [category('child', [category('leaf')])]), archived];
    expect(categoryParents(tree).map((row) => row.id)).toEqual(['root', 'child']);
  });
});
