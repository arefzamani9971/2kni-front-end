import { describe, expect, it, vi } from 'vitest';
import type { Api } from '@dukani/http';
import { createHttpCatalog } from './http-catalog';
describe('catalog search transport', () => {
  it('uses the scoped barcode endpoint filter only for valid barcode input', async () => {
    const get = vi.fn().mockResolvedValue({ items: [], nextCursor: null });
    const catalog = createHttpCatalog({ get } as unknown as Api);
    await catalog.items('store', '4006381333931', 'type');
    expect(get.mock.calls[0]?.[1]).toMatchObject({
      path: { storeId: 'store' },
      query: { barcode: '4006381333931', q: undefined, productTypeId: 'type' },
    });
    await catalog.items('store', '4006381333932');
    expect(get.mock.calls[1]?.[1]?.query).toMatchObject({ q: '4006381333932', barcode: undefined });
    await catalog.items('store', 'blue pen');
    expect(get.mock.calls[2]?.[1]?.query).toMatchObject({ q: 'blue pen', barcode: undefined });
  });
});
