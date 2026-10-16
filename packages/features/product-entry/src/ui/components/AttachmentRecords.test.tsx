import { render } from '@dukani/i18n/testing';
import { act, renderHook, screen, fireEvent } from '@testing-library/react';
import { memo, type ReactNode } from 'react';
import { createDataClient, DataProvider, useQueryCache } from '@dukani/data';
import { ViewportProvider, useLocalList } from '@dukani/ui-kit';
import { AttachmentRecords } from './AttachmentRecords';
import { emptyAttachmentDraft } from '../../domain/catalog-attachment';
import type { AttachmentCandidate, AttachmentDraft } from '../../domain/catalog-attachment.types';
import { useAttachmentSelection } from '../hooks/use-attachment-selection';
import type { AttachmentSelectionPanelProps } from './AttachmentSelectionPanel.types';

const shells = vi.hoisted(() => vi.fn());
vi.mock('@dukani/platform', () => ({ useActiveStore: () => ({ id: 'store' }) }));
// Observe feature cells through their own module, without reaching into ui-kit's internals.
vi.mock('./AttachmentRecordCell', async (original) => {
  const actual = await original<typeof import('./AttachmentRecordCell')>();
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
    candidates,
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
