import { render } from '@dukani/i18n/testing';
import { act, renderHook, screen, fireEvent } from '@testing-library/react';
import { memo, type ReactNode } from 'react';
import { createDataClient, DataProvider, useQueryCache } from '@dukani/data';
import { I18nProvider } from '@dukani/i18n';
import { ViewportProvider, useLocalList } from '@dukani/ui-kit';
import { AttachmentRecords } from '../components/AttachmentRecords';
import type * as AttachmentRecordCellModule from '../components/AttachmentRecordCell';
import { emptyAttachmentDraft } from '../../../domain/catalog-attachment';
import type { AttachmentCandidate, AttachmentDraft } from '../../../domain/catalog-attachment.types';
import { useAttachmentSelection } from '../hooks/use-attachment-selection';
import type { AttachmentSelectionPanelProps } from '../types/AttachmentSelectionPanel.types';
import type { AttachmentRecordsProps } from '../types/AttachmentRecords.types';

const shells = vi.hoisted(() => vi.fn());
vi.mock('@dukani/platform', () => ({ useActiveStore: () => ({ id: 'store' }) }));
// Observe feature cells through their own module, without reaching into ui-kit's internals.
vi.mock('../components/AttachmentRecordCell', async (original) => {
  const actual = await original<typeof AttachmentRecordCellModule>();
  return {
    AttachmentRecordCell: memo((props: Parameters<typeof actual.AttachmentRecordCell>[0]) => {
      shells(props.candidate.item.id);
      return <actual.AttachmentRecordCell {...props} />;
    }),
  };
});

it('uses header selection from the canonical draft and keeps unrelated cells stable', () => {
  const candidates: AttachmentCandidate[] = ['one', 'two', 'three'].map((id) => ({
    item: { id, title: id, productTypeId: 'type', productTypeName: 'Type' },
    units: [{ id: id + '-unit', name: 'piece', kind: 'Base', barcodes: [] }],
  }));
  const client = createDataClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DataProvider client={client}>{children}</DataProvider>
  );
  const hook = renderHook(
    () => {
      const cache = useQueryCache();
      const edit = (change: (draft: AttachmentDraft) => AttachmentDraft) =>
        cache.set(
          ['catalog-attachments-draft', 'store'],
          change(cache.get<AttachmentDraft>(['catalog-attachments-draft', 'store'])!),
        );
      const state = { busy: false, edit } as AttachmentSelectionPanelProps['state'];
      const adapter = useAttachmentSelection(state, candidates, 'limit');
      return { cache, ...adapter, source: useLocalList<AttachmentCandidate, 'title'>(candidates) };
    },
    { wrapper },
  );
  act(() => hook.result.current.cache.set(['catalog-attachments-draft', 'store'], emptyAttachmentDraft()));
  const props = {
    source: hook.result.current.source,
    selection: hook.result.current.selection,
    disabled: false,
    onChange: vi.fn(),
    onSelectAllResults: async () => [],
  };
  const view = render(
    <ViewportProvider forced="desktop">
      <AttachmentRecords {...props} />
    </ViewportProvider>,
  );
  shells.mockClear();
  fireEvent.click(screen.getByRole('checkbox', { name: 'انتخاب two' }));
  expect(hook.result.current.selection.ids()).toEqual(new Set(['two']));
  expect(screen.getByRole('checkbox', { name: 'انتخاب همهٔ موارد این صفحه' })).toBePartiallyChecked();
  expect(shells.mock.calls.filter(([id]) => id !== 'two')).toEqual([]);
  shells.mockClear();
  view.rerender(
    <ViewportProvider forced="desktop">
      <AttachmentRecords {...props} />
    </ViewportProvider>,
  );
  expect(shells).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox', { name: 'انتخاب همهٔ موارد این صفحه' }));
  expect(
    hook.result.current.cache.get<AttachmentDraft>(['catalog-attachments-draft', 'store'])?.selections,
  ).toHaveLength(3);
  fireEvent.click(screen.getByRole('checkbox', { name: 'انتخاب همهٔ موارد این صفحه' }));
  expect(hook.result.current.selection.size()).toBe(0);
});

it.each(['desktop', 'mobile'] as const)(
  'preserves focused editing, row subscriptions and translated columns on %s',
  (viewport) => {
    const candidates: AttachmentCandidate[] = ['one', 'two'].map((id) => ({
      item: { id, title: id, productTypeId: 'type', productTypeName: 'Type' },
      units: [{ id: id + '-unit', name: 'piece', kind: 'Base', barcodes: [{ code: id + '-code' }] }],
    }));
    const client = createDataClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DataProvider client={client}>{children}</DataProvider>
    );
    const hook = renderHook(
      () => {
        const cache = useQueryCache();
        const key = ['catalog-attachments-draft', 'store'];
        const edit = (change: (draft: AttachmentDraft) => AttachmentDraft) =>
          cache.set(key, change(cache.get<AttachmentDraft>(key)!));
        const state = { busy: false, edit } as AttachmentSelectionPanelProps['state'];
        const adapter = useAttachmentSelection(state, candidates, 'limit');
        const onChange: AttachmentRecordsProps['onChange'] = (id, changes) =>
          edit((draft) => ({
            ...draft,
            selections: draft.selections.map((entry) =>
              entry.row.catalogItemId === id ? { ...entry, row: { ...entry.row, ...changes } } : entry,
            ),
          }));
        return {
          cache,
          onChange,
          ...adapter,
          source: useLocalList<AttachmentCandidate, 'title'>(candidates),
        };
      },
      { wrapper },
    );
    act(() => hook.result.current.cache.set(['catalog-attachments-draft', 'store'], emptyAttachmentDraft()));
    const props = {
      source: hook.result.current.source,
      selection: hook.result.current.selection,
      disabled: false,
      onChange: hook.result.current.onChange,
      onSelectAllResults: async () => [],
    };
    const view = render(
      <I18nProvider locale="fa" messages={{}}>
        <ViewportProvider forced={viewport}>
          <AttachmentRecords {...props} />
        </ViewportProvider>
      </I18nProvider>,
    );
    expect(screen.getAllByRole('textbox', { name: /بارکد فروشگاه/ })[0]).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'انتخاب one' }));
    const input = screen.getAllByRole('textbox', { name: /بارکد فروشگاه/ })[0]!;
    expect(input).toBeEnabled();
    input.focus();
    shells.mockClear();
    for (const value of ['0', '00', '001']) {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(value);
      expect(input).toHaveFocus();
      expect(screen.getAllByRole('textbox', { name: /بارکد فروشگاه/ })[0]).toBe(input);
    }
    expect(hook.result.current.selection.get('one')?.row.localBarcode).toBe('001');
    expect(hook.result.current.selection.get('two')).toBeUndefined();
    expect(shells.mock.calls.filter(([id]) => id === 'two')).toEqual([]);

    view.rerender(
      <I18nProvider locale="en" messages={{}}>
        <ViewportProvider forced={viewport}>
          <AttachmentRecords {...props} />
        </ViewportProvider>
      </I18nProvider>,
    );
    expect(screen.getAllByRole('textbox', { name: /Store barcode/ })[0]).toBe(input);
    expect(input).toHaveValue('001');
    expect(input).toHaveFocus();
    expect(screen.getAllByText('Original barcode').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select one' }));
    expect(screen.getAllByRole('textbox', { name: /Store barcode/ })[0]).toBeDisabled();
  },
);
