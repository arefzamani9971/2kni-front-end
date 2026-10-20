import type { ComponentProps, ReactNode } from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import type * as UiKit from '@dukani/ui-kit';
import { newDraft } from '../../../domain/entry-draft';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { UnitPackRow } from '../components/UnitPackRow';
import { UnitsForm } from '../components/UnitsForm';

const mocks = vi.hoisted(() => ({ names: [] as string[], step: vi.fn() }));
vi.mock('@dukani/ui-kit', async (original) => {
  const kit = await original<typeof UiKit>();
  return {
    ...kit,
    TextField: (props: ComponentProps<typeof kit.TextField>) => {
      mocks.names.push(props.value ?? '');
      return <kit.TextField {...props} />;
    },
  };
});
vi.mock('../../common/hooks/use-entry-nav', () => ({
  useEntryNav: () => ({ back: vi.fn(), step: mocks.step }),
}));
vi.mock('../../common/components/EntryShell', () => ({
  EntryShell: ({ children, actions }: { children: ReactNode; actions: ReactNode }) => (
    <main>
      {children}
      {actions}
    </main>
  ),
}));

const store = () => {
  const initial = newDraft('draft', {
    source: 'new',
    productType: { id: 'type', name: 'خودکار', baseUnit: { id: 'piece', name: 'عدد', maxDecimals: 0 } },
  });
  let draft: EntryDraft = {
    ...initial,
    newItem: {
      ...initial.newItem!,
      unitsEditor: [
        { name: 'بسته', baseQty: '12' },
        { name: 'کارتن', baseQty: '24' },
      ],
    },
  };
  const save = vi.fn(async (update: (current: EntryDraft) => EntryDraft) => {
    draft = update(draft);
    return draft;
  });
  return { current: () => draft, save };
};

beforeEach(() => {
  mocks.names.length = 0;
  mocks.step.mockReset();
});

it('preserves all raw edits, focused input and unrelated package renders', async () => {
  const drafts = store();
  const item = drafts.current().newItem!;
  render(<UnitsForm draftId="draft" item={item} save={drafts.save} />);
  const name = screen.getAllByLabelText('نام بسته')[0]!;
  const sibling = screen.getAllByLabelText('نام بسته')[1]!;
  const siblingRenders = mocks.names.filter((value) => value === 'کارتن').length;
  name.focus();
  for (const value of ['بسته ۱', 'بسته ۱۲']) fireEvent.change(name, { target: { value } });
  expect(screen.getAllByLabelText('نام بسته')[0]).toBe(name);
  expect(name).toHaveFocus();
  expect(screen.getAllByLabelText('نام بسته')[1]).toBe(sibling);

  fireEvent.change(screen.getAllByLabelText('تعداد هر بسته')[0]!, { target: { value: '18' } });
  fireEvent.change(screen.getAllByLabelText(/بارکد سازنده/)[0]!, { target: { value: '0012' } });
  fireEvent.click(screen.getAllByRole('checkbox', { name: 'قابل فروش' })[0]!);
  fireEvent.click(screen.getAllByRole('checkbox', { name: 'قابل خرید' })[0]!);
  await act(async () => undefined);
  expect(drafts.current().newItem?.unitsEditor).toEqual([
    { name: 'بسته ۱۲', baseQty: '18', barcode: '0012', isSellable: false, isPurchasable: false },
    { name: 'کارتن', baseQty: '24' },
  ]);
  expect(mocks.names.filter((value) => value === 'کارتن')).toHaveLength(siblingRenders);

  fireEvent.click(screen.getByRole('button', { name: 'ادامه به موجودی' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'بسته باید دست‌کم برای خرید یا فروش قابل استفاده باشد.',
  );
  expect(mocks.step).not.toHaveBeenCalled();
  fireEvent.click(screen.getAllByRole('checkbox', { name: 'قابل خرید' })[0]!);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getAllByLabelText(/بارکد سازنده/)[0]).toHaveValue('0012');
});

it('edits the remaining row after deletion and commits the same package fields', async () => {
  const drafts = store();
  render(<UnitsForm draftId="draft" item={drafts.current().newItem!} save={drafts.save} />);
  fireEvent.click(screen.getAllByRole('button', { name: 'حذف بسته' })[0]!);
  const remaining = screen.getByLabelText('نام بسته');
  expect(remaining).toHaveValue('کارتن');
  remaining.focus();
  fireEvent.change(remaining, { target: { value: 'کارتن کوچک' } });
  fireEvent.change(screen.getByLabelText('تعداد هر بسته'), { target: { value: '6' } });
  expect(screen.getByLabelText('نام بسته')).toBe(remaining);
  expect(remaining).toHaveFocus();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'ادامه به موجودی' })));
  expect(drafts.current().newItem?.packagings).toEqual([
    { name: 'کارتن کوچک', baseQty: '6', isSellable: true, isPurchasable: true },
  ]);
  expect(mocks.step).toHaveBeenCalledWith('draft', 'stock');
});

it('uses updated callbacks and row index without remounting the row inputs', () => {
  const firstChange = vi.fn();
  const firstRemove = vi.fn();
  const nextChange = vi.fn();
  const nextRemove = vi.fn();
  const row = { name: 'بسته', baseQty: '12' };
  const view = render(
    <UnitPackRow
      row={row}
      index={0}
      base="عدد"
      maxDecimals={0}
      onChange={firstChange}
      onRemove={firstRemove}
    />,
  );
  const name = screen.getByLabelText('نام بسته');
  name.focus();
  view.rerender(
    <UnitPackRow
      row={row}
      index={1}
      base="عدد"
      maxDecimals={0}
      onChange={nextChange}
      onRemove={nextRemove}
    />,
  );
  expect(screen.getByLabelText('نام بسته')).toBe(name);
  expect(name).toHaveFocus();
  fireEvent.change(name, { target: { value: 'کارتن' } });
  fireEvent.click(screen.getByRole('button', { name: 'حذف بسته' }));
  expect(nextChange).toHaveBeenCalledWith(1, { name: 'کارتن' });
  expect(nextRemove).toHaveBeenCalledWith(1);
  expect(firstChange).not.toHaveBeenCalled();
  expect(firstRemove).not.toHaveBeenCalled();
});
