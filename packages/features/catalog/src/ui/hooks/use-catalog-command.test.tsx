import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataProvider, createDataClient } from '@dukani/data';
import { appError, newOperationId } from '@dukani/domain';
import { createMemoryDraftStore } from '@dukani/platform';
import { createCommandJournal } from '../../infrastructure/command-journal';
import { useCatalogCommand } from './use-catalog-command';
const fixture = vi.hoisted(() => ({ journal: null as unknown }));
vi.mock('../../module', () => ({ useCatalogModule: () => ({ journal: fixture.journal }) }));
vi.mock('@dukani/platform', async (original) => ({
  ...(await original<object>()),
  useActiveStore: () => ({ id: 'store', name: 'Store' }),
}));
const setup = () => {
  const journal = createCommandJournal(createMemoryDraftStore(), () => 'user');
  fixture.journal = journal;
  const client = createDataClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DataProvider client={client}>{children}</DataProvider>
  );
  return { journal, wrapper };
};
describe('catalog command recovery', () => {
  it('retains a sent intent after lost responses and recovers it with the same id after refresh', async () => {
    const { journal, wrapper } = setup();
    const payload = { name: 'Brand', nested: { baseQty: '0.5' } };
    const write = vi.spyOn(journal, 'write');
    const run = vi.fn().mockRejectedValue(appError('Unknown', 'NETWORK', ''));
    const first = renderHook(() => useCatalogCommand('brand:host', run, () => {}), { wrapper });
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    await act(async () => {
      await first.result.current.submit(payload);
    });
    expect(first.result.current.unknown).toBe(true);
    const intent = await journal.read('store', 'brand:host');
    expect(run).toHaveBeenCalledTimes(2);
    expect(write).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0]?.[1]).toBe(run.mock.calls[1]?.[1]);
    first.unmount();
    const client = createDataClient();
    const Fresh = ({ children }: { children: ReactNode }) => (
      <DataProvider client={client}>{children}</DataProvider>
    );
    run.mockResolvedValue('created');
    const recovery = renderHook(() => useCatalogCommand('brand:host', run, () => {}), { wrapper: Fresh });
    await waitFor(() => expect(recovery.result.current.unknown).toBe(true));
    await act(async () => {
      await recovery.result.current.retry();
    });
    expect(run.mock.calls[2]).toEqual([payload, intent?.operationId]);
    expect(recovery.result.current.state.kind).toBe('succeeded');
  });
  it('replays the original operation id and complete payload after remount', async () => {
    const { journal, wrapper } = setup();
    const id = newOperationId();
    const payload = { name: 'Half pack', packages: [{ name: 'Half', baseQty: '0.5' }] };
    await journal.write('store', 'type:host', { schemaVersion: 1, operationId: id, payload });
    const run = vi.fn(async () => 'created');
    const success = vi.fn();
    const { result } = renderHook(() => useCatalogCommand('type:host', run, success), { wrapper });
    await waitFor(() => expect(result.current.unknown).toBe(true));
    await act(async () => {
      await result.current.retry();
    });
    expect(run).toHaveBeenCalledWith(payload, id);
    expect(await journal.read('store', 'type:host')).toBeNull();
    expect(success).toHaveBeenCalledWith('created');
  });
  it('uses a new operation id for a corrected payload after definitive failure', async () => {
    const { journal, wrapper } = setup();
    const id = newOperationId();
    await journal.write('store', 'brand:host', { schemaVersion: 1, operationId: id, payload: 'duplicate' });
    const run = vi
      .fn()
      .mockRejectedValueOnce(appError('Conflict', 'BRAND_DUPLICATE', ''))
      .mockResolvedValue('brand');
    const { result } = renderHook(() => useCatalogCommand('brand:host', run, () => {}), { wrapper });
    await waitFor(() => expect(result.current.unknown).toBe(true));
    await act(async () => {
      await result.current.retry();
    });
    await waitFor(() => expect(result.current.unknown).toBe(false));
    await act(async () => {
      await result.current.submit('corrected');
    });
    expect(run.mock.calls[1]?.[0]).toBe('corrected');
    expect(run.mock.calls[1]?.[1]).not.toBe(id);
  });
  it('keeps confirmed success and selects the result when local journal cleanup fails', async () => {
    const { journal, wrapper } = setup();
    vi.spyOn(journal, 'remove').mockRejectedValue(new Error('storage unavailable'));
    const success = vi.fn();
    const run = vi.fn(async () => 'created');
    const { result } = renderHook(() => useCatalogCommand('brand:host', run, success), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.submit('brand');
    });
    expect(result.current.state.kind).toBe('succeeded');
    expect(success).toHaveBeenCalledWith('created');
    expect(run).toHaveBeenCalledTimes(1);
    expect(result.current.completionErrors).toHaveLength(1);
  });
});
