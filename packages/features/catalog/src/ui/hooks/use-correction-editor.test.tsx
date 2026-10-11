import { act, renderHook } from '@testing-library/react';
import { appError } from '@dukani/domain';
import type { CorrectionCapabilities } from '../../domain/correction.types';
import { emptyCorrectionDraft, toggleField } from '../../domain/correction';
import { useCorrectionEditor } from './use-correction-editor';

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  invalidate: vi.fn(),
  error: null as ReturnType<typeof appError> | null,
}));
vi.mock('@dukani/platform', () => ({ useActiveStore: () => ({ id: 'store' }) }));
vi.mock('@dukani/data', () => ({ useInvalidate: () => mocks.invalidate }));
vi.mock('../../module', () => ({ useCatalogModule: () => ({ corrections: { create: vi.fn() } }) }));
vi.mock('./use-catalog-command', () => ({
  useCatalogCommand: () => ({ submit: mocks.submit, busy: false, unknown: false, error: mocks.error }),
}));

const capabilities: CorrectionCapabilities = {
  catalogItemId: 'item',
  title: 'Blue pen',
  openCorrectionId: null,
  fields: [
    {
      key: 'title',
      valueType: 'Text',
      currentValue: 'Blue pen',
      clearable: false,
      maxLength: 250,
      allowedValues: [],
    },
  ],
};
const render = () =>
  renderHook(() =>
    useCorrectionEditor({
      capabilities,
      initial: emptyCorrectionDraft,
      persist: () => Promise.resolve(),
      clear: () => Promise.resolve(),
      onCreated: vi.fn(),
    }),
  );
beforeEach(() => {
  vi.clearAllMocks();
  mocks.error = null;
});

describe('correction form (F11 §6)', () => {
  it('shows issues only after a send attempt and sends nothing invalid', async () => {
    const { result } = render();
    expect(result.current.issues).toEqual([]);
    await act(() => result.current.submit());
    expect(result.current.issues.map((i) => i.field)).toEqual(['selection', 'reason']);
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('sends only the selected server key with the reason', async () => {
    const { result } = render();
    act(() =>
      result.current.setDraft((d) => ({
        ...toggleField(d, capabilities.fields[0]!, true),
        values: { title: 'Blue pen model A' },
        reason: 'Label says model A',
      })),
    );
    await act(() => result.current.submit());
    expect(mocks.submit).toHaveBeenCalledWith({
      proposedChanges: { title: 'Blue pen model A' },
      reason: 'Label says model A',
      evidenceFileIds: [],
    });
  });

  it('reads the capabilities again when the server rejects a key or has an open request', () => {
    mocks.error = appError('Validation', 'CHANGE_KEY_UNSUPPORTED', 'x', {
      fieldErrors: { 'proposedChanges.title': ['Not editable'] },
    });
    const { result } = render();
    expect(mocks.invalidate).toHaveBeenCalledWith(['catalog', 'store', 'correction-capabilities', 'item']);
    expect(result.current.serverMessage('title')).toBe('Not editable');
  });
});
