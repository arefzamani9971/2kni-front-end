import { act, renderHook, waitFor } from '@testing-library/react';
import { DataProvider, createDataClient } from '@dukani/data';
import { I18nProvider } from '@dukani/i18n';
import { appError } from '@dukani/domain';
import type { Dto } from '@dukani/contracts';
import type { ReactNode } from 'react';
import { usePurchaseLines } from '../hooks/use-purchase-lines';
import { usePurchaseAttachments } from '../hooks/use-purchase-attachments';
const mocks = vi.hoisted(() => ({
  store: { id: 'store' },
  nav: { replace: vi.fn(), push: vi.fn(), back: vi.fn() },
  toast: vi.fn(),
  save: vi.fn(),
  discard: vi.fn(),
  upload: vi.fn(),
  attach: vi.fn(),
  purchase: null as Dto<'PurchaseDto'> | null,
}));
vi.mock('@dukani/platform', () => ({ useActiveStore: () => mocks.store, useNavigation: () => mocks.nav }));
vi.mock('@dukani/ui-kit', () => ({ useToast: () => mocks.toast }));
vi.mock('../../../module', () => ({
  usePurchasingModule: () => ({
    files: { upload: mocks.upload },
    purchases: { discard: mocks.discard, setAttachments: mocks.attach },
  }),
}));
vi.mock('../hooks/use-purchase', () => ({ usePurchase: () => ({ data: mocks.purchase }) }));
vi.mock('../hooks/use-save-draft', () => ({
  useSaveDraft: () => ({ mutateAsync: mocks.save, error: null, isPending: false }),
}));
const wrapper = () => {
  const client = createDataClient();
  return function Providers({ children }: { children: ReactNode }) {
    return (
      <I18nProvider locale="en" messages={{}}>
        <DataProvider client={client}>{children}</DataProvider>
      </I18nProvider>
    );
  };
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.purchase = {
    id: 'receipt',
    status: 'Draft',
    version: 1,
    attachmentFileIds: ['existing'],
    lines: [
      {
        id: 'line',
        storeProductId: 'product',
        storeProductUnitId: 'unit',
        title: 'Product',
        unitName: 'piece',
        baseQtyPerUnit: '1',
        quantity: '2',
        costStatus: 'Unknown',
        unitCostAmount: null,
      },
    ],
  } as Dto<'PurchaseDto'>;
});
describe('receipt editing failures', () => {
  it('keeps the line editor open on failure and closes it only after a successful save', async () => {
    const { result } = renderHook(() => usePurchaseLines('receipt'), { wrapper: wrapper() });
    act(() => result.current.setEditing({ productId: 'product', index: 0 }));
    mocks.save.mockRejectedValueOnce(appError('Conflict', 'VERSION_CONFLICT', 'Changed'));
    const line = {
      storeProductId: 'product',
      title: 'Product',
      baseUnitName: 'piece',
      unitId: 'unit',
      unitName: 'piece',
      baseQtyPerUnit: '1',
      quantity: '3',
      costStatus: 'Unknown',
      unitCost: null,
      productionDate: null,
      expiryDate: null,
    } as Parameters<typeof result.current.saveLine>[0];
    await act(() => result.current.saveLine(line));
    expect(result.current.editing?.index).toBe(0);
    expect(mocks.toast).not.toHaveBeenCalled();
    mocks.save.mockResolvedValueOnce(mocks.purchase);
    await act(() => result.current.saveLine(line));
    expect(result.current.editing).toBeNull();
    expect(mocks.toast).toHaveBeenCalled();
  });
  it('handles failed removal without an unhandled rejection', async () => {
    mocks.save.mockRejectedValueOnce(appError('Server', 'HTTP_503', 'Unavailable'));
    const { result } = renderHook(() => usePurchaseLines('receipt'), { wrapper: wrapper() });
    await act(() => result.current.removeLine(0));
    expect(mocks.save).toHaveBeenCalledTimes(1);
    expect(mocks.nav.replace).not.toHaveBeenCalled();
  });
  it('shows a failed discard and stays on the receipt', async () => {
    mocks.discard.mockRejectedValueOnce(appError('Permission', 'PERMISSION_DENIED', 'Denied'));
    const { result } = renderHook(() => usePurchaseLines('receipt'), { wrapper: wrapper() });
    await act(() => result.current.discardDraft());
    await waitFor(() => expect(result.current.saveError?.kind).toBe('Permission'));
    expect(mocks.nav.replace).not.toHaveBeenCalled();
  });
});
describe('receipt attachment orchestration', () => {
  it('retries attachment linking without uploading again', async () => {
    mocks.upload.mockResolvedValue({ fileId: 'uploaded' });
    mocks.attach
      .mockRejectedValueOnce(appError('Server', 'HTTP_503', 'Unavailable'))
      .mockResolvedValueOnce(mocks.purchase);
    const { result } = renderHook(() => usePurchaseAttachments('receipt'), { wrapper: wrapper() });
    act(() => result.current.setPicked([{ id: 'a', file: new File(['a'], 'a.pdf') }]));
    await act(() => result.current.save());
    expect(result.current.saving).toBe(false);
    expect(mocks.nav.replace).not.toHaveBeenCalled();
    await act(() => result.current.save());
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(mocks.attach).toHaveBeenLastCalledWith('store', 'receipt', ['existing', 'uploaded']);
    expect(mocks.nav.replace).toHaveBeenCalledTimes(1);
  });
  it('prevents two saves from dispatching duplicate uploads', async () => {
    mocks.upload.mockResolvedValue({ fileId: 'uploaded' });
    mocks.attach.mockResolvedValue(mocks.purchase);
    const { result } = renderHook(() => usePurchaseAttachments('receipt'), { wrapper: wrapper() });
    act(() => result.current.setPicked([{ id: 'a', file: new File(['a'], 'a.pdf') }]));
    await act(async () => {
      await Promise.all([result.current.save(), result.current.save()]);
    });
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(mocks.attach).toHaveBeenCalledTimes(1);
    expect(result.current.saving).toBe(false);
  });
});
