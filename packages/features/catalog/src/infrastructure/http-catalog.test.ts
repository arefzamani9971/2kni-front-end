import { describe, expect, it, vi } from 'vitest';
import type { Api } from '@dukani/http';
import { createHttpCatalog } from './http-catalog';

const query = (q: string, productTypeId: string | null = null) => ({
  page: 2,
  pageSize: 50,
  sort: [{ field: 'title' as const, direction: 'desc' as const }],
  filter: { q, productTypeId },
});

describe('catalog list transport (F07, PAT-LIST-01)', () => {
  it('posts page, size, sortModel and explicit defaults that hide nothing', async () => {
    const post = vi.fn().mockResolvedValue({
      items: [],
      page: 2,
      pageSize: 50,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });
    const catalog = createHttpCatalog({ post } as unknown as Api);
    await catalog.itemPage('store', query(' blue pen ', 'type'));
    expect(post).toHaveBeenCalledWith('/api/v1/stores/{storeId}/catalog/items/search', {
      path: { storeId: 'store' },
      body: {
        page: 2,
        pageSize: 50,
        sortModel: [{ colId: 'title', sort: 'desc' }],
        q: 'blue pen',
        productTypeId: 'type',
        onlyNotInMyStore: false,
        onlyStoreType: false,
      },
      signal: undefined,
    });
  });

  it('searches the unit barcode only for a valid GTIN, Persian digits included', async () => {
    const post = vi.fn().mockResolvedValue({ items: [] });
    const catalog = createHttpCatalog({ post } as unknown as Api);
    await catalog.itemPage('store', query('4006381333931'));
    await catalog.itemPage('store', query('۴۰۰۶۳۸۱۳۳۳۹۳۱'));
    await catalog.itemPage('store', query('4006381333932'));
    await catalog.itemPage('store', query(''));
    const bodies = post.mock.calls.map((call) => call[1].body);
    expect(bodies[0]).toMatchObject({ barcode: '4006381333931' });
    expect(bodies[0]).not.toHaveProperty('q');
    expect(bodies[1]).toMatchObject({ barcode: '4006381333931' });
    expect(bodies[2]).toMatchObject({ q: '4006381333932' });
    expect(bodies[2]).not.toHaveProperty('barcode');
    expect(bodies[3]).toMatchObject({ q: undefined, productTypeId: undefined });
  });

  it('maps optional summary fields to null', async () => {
    const post = vi.fn().mockResolvedValue({
      items: [{ id: 'i', title: 'Pen', productTypeId: 't', productTypeName: 'Pen', status: 'Public' }],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
    const page = await createHttpCatalog({ post } as unknown as Api).itemPage('store', query('pen'));
    expect(page).toMatchObject({ totalCount: 1, totalPages: 1 });
    expect(page.items[0]).toMatchObject({ brandName: null, keyAttributes: null, myStoreProductId: null });
  });
});
