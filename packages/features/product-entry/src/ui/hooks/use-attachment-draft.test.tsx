import { act, renderHook } from '@testing-library/react';
import { emptyAttachmentDraft, selectAttachmentCandidates } from '../../domain/catalog-attachment';
import type { AttachmentDraft } from '../../domain/catalog-attachment.types';
import { useAttachmentDraft } from './use-attachment-draft';

const mocks = vi.hoisted(() => ({
  data: {} as AttachmentDraft,
  update: vi.fn(),
  invalidate: vi.fn(),
  set: vi.fn(),
  submit: vi.fn(),
}));
vi.mock('@dukani/platform', () => ({ useActiveStore: () => ({ id: 'store' }) }));
vi.mock('@dukani/data', () => ({
  useAppQuery: () => ({ data: mocks.data }),
  useQueryCache: () => ({ set: mocks.set, get: () => mocks.data }),
  useInvalidate: () => mocks.invalidate,
}));
vi.mock('../../module', () => ({
  useProductEntryModule: () => ({ attachmentDrafts: { update: mocks.update }, attachments: {} }),
}));
vi.mock('../../application/catalog-attachment-workflow', () => ({
  previewAttachments: vi.fn(),
  submitAttachments: mocks.submit,
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.data = emptyAttachmentDraft();
  mocks.set.mockImplementation((_key, next) => {
    mocks.data = next;
  });
  mocks.update.mockImplementation(async (_store, transform) => {
    mocks.data = transform(mocks.data);
    return mocks.data;
  });
});

it('publishes rapid selections immediately without loading or stale write completions resetting them', async () => {
  const complete: (() => void)[] = [];
  mocks.update.mockImplementation((_store, transform) => {
    const snapshot = transform(mocks.data);
    return new Promise((resolve) => complete.push(() => resolve(snapshot)));
  });
  const { result } = renderHook(useAttachmentDraft);
  const select = (id: string) =>
    result.current.edit((current) => ({
      ...current,
      selections: selectAttachmentCandidates(current.selections, [
        {
          item: { id, title: id, productTypeId: 'type', productTypeName: 'Type' },
          units: [{ id: id + '-unit', name: 'piece', kind: 'Base', barcodes: [] }],
        },
      ]),
    }));
  act(() => {
    select('one');
    select('two');
  });
  expect(mocks.data.selections).toHaveLength(2);
  expect(result.current.busy).toBe(false);
  await act(async () => {
    complete[0]!();
  });
  expect(mocks.data.selections).toHaveLength(2);
  await act(async () => {
    complete[1]!();
  });
  expect(mocks.data.selections).toHaveLength(2);
  expect(mocks.set).toHaveBeenCalledTimes(2);
});

it('keeps visible edits and reports a failed background save', async () => {
  mocks.update.mockRejectedValueOnce(new Error('storage unavailable'));
  const { result } = renderHook(useAttachmentDraft);
  await act(async () => result.current.edit((current) => ({ ...current, stage: 'review' })));
  expect(mocks.data.stage).toBe('review');
  expect(result.current.error).toBeDefined();
  expect(result.current.busy).toBe(false);
  await act(async () => {
    await result.current.update((current) => current);
  });
  expect(mocks.data.stage).toBe('review');
});

it.each([false, true])(
  'refreshes each cache once after multiple durable results (interrupted=%s)',
  async (interrupted) => {
    mocks.submit.mockImplementation(async (_api, _store, draft, save) => {
      const next = { ...draft, chunks: [{ result: { results: [{ status: 'Added' }] } }] };
      await save(next);
      await save(next);
      await save(next);
      expect(mocks.invalidate).not.toHaveBeenCalled();
      if (interrupted) throw new Error('network');
    });
    const { result } = renderHook(useAttachmentDraft);
    await act(() => result.current.submit());
    expect(mocks.update).toHaveBeenCalledTimes(3);
    expect(mocks.invalidate.mock.calls).toEqual([
      [['catalog', 'store']],
      [['products', 'store']],
      [['catalog-attachment-candidates', 'store']],
    ]);
    expect(Boolean(result.current.error)).toBe(interrupted);
  },
);
