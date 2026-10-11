import { act, renderHook } from '@testing-library/react';
import { DataProvider, createDataClient } from '@dukani/data';
import { I18nProvider } from '@dukani/i18n';
import { appError } from '@dukani/domain';
import type { Dto } from '@dukani/contracts';
import type { ReactNode } from 'react';
import { useLocalEdit } from './use-local-edit';

const mocks = vi.hoisted(() => ({ updateLocal: vi.fn(), get: vi.fn() }));
vi.mock('@dukani/platform', () => ({ useActiveStore: () => ({ id: 'store' }) }));
vi.mock('../../module', () => ({
  useProductsModule: () => ({ products: { updateLocal: mocks.updateLocal, get: mocks.get } }),
}));

const product = (over: Partial<Dto<'StoreProductDto'>> = {}) =>
  ({
    id: 'p1',
    title: 'Blue pen',
    catalogTitle: 'Blue pen',
    localTitle: null,
    localNote: null,
    shortcut: 'P1',
    kind: 'Goods',
    status: 'Active',
    version: 3,
    serviceCostAmount: null,
    ...over,
  }) as Dto<'StoreProductDto'>;
const values = { localTitle: 'School pen', localNote: '', changeServiceCost: false, serviceCostAmount: null };
const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider locale="en" messages={{}}>
    <DataProvider client={createDataClient()}>{children}</DataProvider>
  </I18nProvider>
);
beforeEach(() => vi.clearAllMocks());

describe('local edit (F11 §5)', () => {
  it('saves with the read version and keeps the shortcut', async () => {
    mocks.updateLocal.mockResolvedValueOnce(product({ localTitle: 'School pen', version: 4 }));
    const { result } = renderHook(() => useLocalEdit(product()), { wrapper });
    await act(() => result.current.save(values));
    expect(mocks.updateLocal).toHaveBeenCalledWith(
      'store',
      'p1',
      expect.objectContaining({ expectedVersion: 3, shortcut: 'P1', localTitle: 'School pen' }),
    );
    expect(result.current.state.kind).toBe('saved');
  });

  it('shows the fresh values on 409 and retries with the fresh version, keeping the form', async () => {
    mocks.updateLocal.mockRejectedValueOnce(appError('Conflict', 'VERSION_CONFLICT', 'Changed'));
    mocks.get.mockResolvedValueOnce(product({ localTitle: 'Office pen', version: 5 }));
    const { result } = renderHook(() => useLocalEdit(product()), { wrapper });
    await act(() => result.current.save(values));
    expect(result.current.state).toMatchObject({ kind: 'conflict', fields: ['localTitle'] });

    mocks.updateLocal.mockResolvedValueOnce(product({ localTitle: 'School pen', version: 6 }));
    await act(() => result.current.save(values));
    expect(mocks.updateLocal).toHaveBeenLastCalledWith(
      'store',
      'p1',
      expect.objectContaining({ expectedVersion: 5 }),
    );
    expect(result.current.state.kind).toBe('saved');
  });

  it('treats a lost response as saved only when the server already holds the change', async () => {
    mocks.updateLocal.mockRejectedValueOnce(appError('Unknown', 'NETWORK', ''));
    mocks.get.mockResolvedValueOnce(product({ localTitle: 'School pen', version: 4 }));
    const { result } = renderHook(() => useLocalEdit(product()), { wrapper });
    await act(() => result.current.save(values));
    expect(result.current.state.kind).toBe('saved');
    expect(mocks.updateLocal).toHaveBeenCalledTimes(1); // never re-sent with a stale version

    mocks.updateLocal.mockRejectedValueOnce(appError('Unknown', 'NETWORK', ''));
    mocks.get.mockResolvedValueOnce(product({ version: 4 }));
    const other = renderHook(() => useLocalEdit(product()), { wrapper });
    await act(() => other.result.current.save(values));
    expect(other.result.current.state.kind).toBe('unknown');
  });

  it('returns field errors to the form instead of showing them as a banner', async () => {
    const invalid = appError('Validation', 'VALIDATION_FAILED', 'Too long', {
      fieldErrors: { localTitle: ['Too long'] },
    });
    mocks.updateLocal.mockRejectedValueOnce(invalid);
    const { result } = renderHook(() => useLocalEdit(product()), { wrapper });
    let returned: unknown;
    await act(async () => {
      returned = await result.current.save(values);
    });
    expect(returned).toBe(invalid);
    expect(result.current.state).toEqual({ kind: 'failed', error: invalid });
  });
});
