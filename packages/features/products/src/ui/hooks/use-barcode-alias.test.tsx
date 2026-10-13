import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataProvider, createDataClient } from '@dukani/data';
import { appError, newOperationId } from '@dukani/domain';
import { I18nProvider } from '@dukani/i18n';
import { useBarcodeAlias } from './use-barcode-alias';
const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  commit: vi.fn(),
  read: vi.fn(),
  write: vi.fn(),
  remove: vi.fn(),
  removeForm: vi.fn(),
  allowed: true,
}));
vi.mock('@dukani/platform', () => ({ useActiveStore: () => ({ id: 'store' }), useCan: () => mocks.allowed }));
vi.mock('../../module', () => {
  const module = {
    barcodeAliases: { preview: mocks.preview, commit: mocks.commit },
    barcodeAliasDrafts: {
      read: mocks.read,
      write: mocks.write,
      remove: mocks.remove,
      removeForm: mocks.removeForm,
    },
  };
  return { useProductsModule: () => module };
});
const payload = {
  storeProductUnitId: 'pack',
  barcode: '00123457',
  expectedVersion: 3,
  previewToken: 'confirmed-preview',
};
const response = {
  storeProductId: 'product',
  storeProductUnitId: 'pack',
  barcode: payload.barcode,
  alreadyExists: false,
};
function setup() {
  const client = createDataClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider locale="en" messages={{}}>
      <DataProvider client={client}>{children}</DataProvider>
    </I18nProvider>
  );
  return renderHook(() => useBarcodeAlias('product'), { wrapper });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.allowed = true;
  mocks.read.mockResolvedValue(null);
  mocks.write.mockResolvedValue(undefined);
  mocks.remove.mockResolvedValue(undefined);
  mocks.removeForm.mockResolvedValue(undefined);
  mocks.commit.mockResolvedValue(response);
});
it('preview is read only; confirmation persists the exact intent before sending and deduplicates clicks', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(() => result.current.preview(payload));
  expect(mocks.commit).not.toHaveBeenCalled();
  expect(mocks.write).not.toHaveBeenCalled();
  await act(() => Promise.all([result.current.submit(payload), result.current.submit(payload)]));
  expect(mocks.commit).toHaveBeenCalledTimes(1);
  const operationId = mocks.commit.mock.calls[0]![3];
  expect(mocks.write).toHaveBeenCalledWith('store', 'product', { schemaVersion: 1, operationId, payload });
  expect(mocks.write.mock.invocationCallOrder[0]).toBeLessThan(mocks.commit.mock.invocationCallOrder[0]!);
  expect(result.current.state.kind).toBe('succeeded');
  expect(mocks.remove).toHaveBeenCalledWith('store', 'product');
});
it('restores an unknown operation after refresh with the original payload and key', async () => {
  const operationId = newOperationId();
  mocks.read.mockResolvedValue({ schemaVersion: 1, operationId, payload });
  const { result } = setup();
  await waitFor(() => expect(result.current.unknown).toBe(true));
  expect(mocks.commit).not.toHaveBeenCalled();
  await act(() => result.current.recover());
  expect(mocks.commit).toHaveBeenCalledWith('store', 'product', payload, operationId);
  expect(mocks.write).not.toHaveBeenCalled();
  expect(result.current.state.kind).toBe('succeeded');
});
it('never dispatches if saving the recovery intent fails', async () => {
  mocks.write.mockRejectedValue(appError('Bug', 'LOCAL_STORAGE', ''));
  const { result } = setup();
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(() => result.current.submit(payload));
  expect(mocks.commit).not.toHaveBeenCalled();
  expect(result.current.state.kind).toBe('failed');
});
it('keeps success when local cleanup fails instead of resending a confirmed mutation', async () => {
  mocks.remove.mockRejectedValue(appError('Bug', 'LOCAL_STORAGE', ''));
  const { result } = setup();
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(() => result.current.submit(payload));
  expect(result.current.state.kind).toBe('succeeded');
  expect(mocks.commit).toHaveBeenCalledTimes(1);
  expect(result.current.completionErrors).toHaveLength(1);
});
it('does not load or send private data without permission', async () => {
  mocks.allowed = false;
  const { result } = setup();
  await act(() => result.current.submit(payload));
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.commit).not.toHaveBeenCalled();
  expect(mocks.write).not.toHaveBeenCalled();
});
