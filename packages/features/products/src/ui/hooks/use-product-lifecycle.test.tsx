import { act, renderHook } from '@testing-library/react';
import { DataProvider, createDataClient } from '@dukani/data';
import { I18nProvider } from '@dukani/i18n';
import { appError } from '@dukani/domain';
import type { Dto } from '@dukani/contracts';
import type { ReactNode } from 'react';
import { useProductLifecycle } from './use-product-lifecycle';

const mocks = vi.hoisted(() => ({ archive: vi.fn(), restore: vi.fn(), get: vi.fn() }));
vi.mock('@dukani/platform', () => ({ useActiveStore: () => ({ id: 'store' }) }));
vi.mock('../../module', () => ({ useProductsModule: () => ({ products: mocks }) }));

const product = { id: 'p1', status: 'Active', version: 7 } as Dto<'StoreProductDto'>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider locale="en" messages={{}}>
    <DataProvider client={createDataClient()}>{children}</DataProvider>
  </I18nProvider>
);
beforeEach(() => vi.clearAllMocks());

describe('archive and restore (F11 §8)', () => {
  it('archives with the version on screen', async () => {
    mocks.archive.mockResolvedValueOnce({ ...product, status: 'Archived', version: 8 });
    const { result } = renderHook(() => useProductLifecycle(product), { wrapper });
    await act(async () => {
      await expect(result.current('archive')).resolves.toMatchObject({ status: 'Archived', version: 8 });
    });
    expect(mocks.archive).toHaveBeenCalledWith('store', 'p1', 7);
    expect(mocks.restore).not.toHaveBeenCalled();
  });

  it('rejects with the failure for the confirmation and reads the product again (title conflict on restore)', async () => {
    mocks.restore.mockRejectedValueOnce(appError('Conflict', 'TITLE_DUPLICATE', 'Taken'));
    mocks.get.mockResolvedValueOnce({ ...product, status: 'Archived', version: 9 });
    const { result } = renderHook(() => useProductLifecycle({ ...product, status: 'Archived' }), { wrapper });
    await act(async () => {
      await expect(result.current('restore')).rejects.toMatchObject({ code: 'TITLE_DUPLICATE' });
    });
    expect(mocks.get).toHaveBeenCalledWith('store', 'p1');
  });
});
