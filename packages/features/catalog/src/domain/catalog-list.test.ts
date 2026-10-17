import { describe, expect, it } from 'vitest';
import { catalogListFilter, isCatalogSearchTooLong } from './catalog-list';

describe('catalog list filter (F07)', () => {
  it('reads the URL and replaces values the endpoint would reject with the defaults', () => {
    const type = '0192f000-0000-7000-8000-000000000001';
    expect(catalogListFilter(' pen ', type)).toEqual({ q: 'pen', productTypeId: type });
    expect(catalogListFilter('x'.repeat(121), 'not-a-type')).toEqual({ q: '', productTypeId: null });
    expect(catalogListFilter('x'.repeat(120), '')).toEqual({ q: 'x'.repeat(120), productTypeId: null });
  });

  it('allows 120 characters and rejects 121 (F07-S02)', () => {
    expect(isCatalogSearchTooLong(` ${'x'.repeat(120)} `)).toBe(false);
    expect(isCatalogSearchTooLong('x'.repeat(121))).toBe(true);
  });
});
