import { render } from '@dukani/i18n/testing';
import { fireEvent, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ListSource } from '@dukani/domain';
import { ViewportProvider } from '../responsive';
import { DataGrid } from './DataGrid';
import type { GridColumn } from './DataGrid.types';
import { createSelectionStore, groupSelectionOf } from './selection-store';
import { useLocalList } from './use-local-list';
import { useSelection } from './use-selection';

type Row = { id: string; title: string; price: number };
const ROWS: Row[] = Array.from({ length: 45 }, (_, i) => ({
  id: `r${i + 1}`,
  title: `کالا ${i + 1}`,
  price: 100 - i,
}));
const renders: Record<string, number> = {};
const COLUMNS: GridColumn<Row, 'title' | 'price'>[] = [
  {
    id: 'title',
    header: 'نام',
    sortField: 'title',
    cell: (row) => {
      renders[row.id] = (renders[row.id] ?? 0) + 1;
      return row.title;
    },
  },
  { id: 'price', header: 'قیمت', sortField: 'price', align: 'end', cell: (row) => String(row.price) },
];
const sortValue = (row: Row, field: 'title' | 'price') => row[field];
const rowId = (row: Row) => row.id;
const rowLabel = (row: Row) => row.title;

function Grid({
  rows = ROWS,
  select = true,
  isRowSelectable,
}: {
  rows?: Row[];
  select?: boolean;
  isRowSelectable?: (row: Row) => boolean;
}) {
  const source = useLocalList(rows, { sortValue, initialPageSize: 10 });
  const selection = useSelection();
  return (
    <DataGrid
      source={source}
      columns={COLUMNS}
      getRowId={rowId}
      getRowLabel={rowLabel}
      label="فهرست"
      unit="کالا"
      selection={select ? selection : undefined}
      isRowSelectable={isRowSelectable}
    />
  );
}
const desktop = (ui: ReactElement) => render(<ViewportProvider forced="desktop">{ui}</ViewportProvider>);
const mobile = (ui: ReactElement) => render(<ViewportProvider forced="mobile">{ui}</ViewportProvider>);
const bodyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);

describe('selection store', () => {
  it('notifies only on real changes and reports group state', () => {
    const store = createSelectionStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setMany(['a', 'b'], true);
    store.set('a', true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(groupSelectionOf(store, ['a', 'b'])).toBe('all');
    expect(groupSelectionOf(store, ['a', 'c'])).toBe('some');
    expect(groupSelectionOf(store, [])).toBe('none');
    const snapshot = store.ids();
    store.toggle('a');
    expect(store.ids()).not.toBe(snapshot);
    store.clear();
    store.clear();
    expect(listener).toHaveBeenCalledTimes(3);
  });
});

describe('DataGrid desktop (table + pager)', () => {
  it('sorts from the header with aria-sort and returns to the default order', () => {
    desktop(<Grid />);
    const header = screen.getByRole('columnheader', { name: /قیمت/ });
    expect(header).toHaveAttribute('aria-sort', 'none');
    fireEvent.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(within(bodyRows()[0]!).getByText('56')).toBeInTheDocument();
    fireEvent.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    fireEvent.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(within(bodyRows()[0]!).getByText('کالا 1')).toBeInTheDocument();
  });

  it('selects the page from the header, shows the mixed state and re-renders only the toggled row', () => {
    desktop(<Grid />);
    const all = screen.getByRole('checkbox', { name: 'انتخاب همهٔ موارد این صفحه' }) as HTMLInputElement;
    fireEvent.click(all);
    expect(screen.getByText('۱۰ کالا انتخاب شده')).toBeInTheDocument();
    expect(all.checked).toBe(true);
    const before = { ...renders };
    fireEvent.click(screen.getByRole('checkbox', { name: 'انتخاب کالا 2' }));
    expect(all.indeterminate).toBe(true);
    expect(renders.r2).toBe(before.r2! + 1);
    expect(renders.r1).toBe(before.r1);
    expect(renders.r3).toBe(before.r3);
    fireEvent.click(screen.getByRole('button', { name: 'لغو انتخاب' }));
    expect(all.checked).toBe(false);
    expect(screen.getByText('۴۵ کالا')).toBeInTheDocument();
  });

  it('pages with numbered buttons, previous/next and page size, keeping selection across pages', () => {
    desktop(<Grid />);
    expect(screen.getByText('۱–۱۰ از ۴۵ کالا')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'انتخاب کالا 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'صفحهٔ ۵' }));
    expect(screen.getByText('۴۱–۴۵ از ۴۵ کالا')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'صفحهٔ بعد' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'صفحهٔ قبل' }));
    expect(screen.getByRole('button', { name: 'صفحهٔ ۴' })).toHaveAttribute('aria-current', 'page');
    fireEvent.change(screen.getByLabelText('تعداد در صفحه'), { target: { value: '50' } });
    expect(screen.getByText('۱–۴۵ از ۴۵ کالا')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'صفحهٔ ۲' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'انتخاب کالا 1' })).toBeChecked();
  });

  it('shows the empty state instead of «page 1 of 0»', () => {
    desktop(<Grid rows={[]} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText(/از ۰/)).not.toBeInTheDocument();
  });
});

describe('DataGrid mobile (cards + infinite scroll)', () => {
  it('builds cards from the same columns and loads more without a pager', () => {
    mobile(<Grid select={false} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-setsize', '20');
    expect(screen.getAllByRole('article').length).toBeLessThanOrEqual(20);
    expect(screen.getAllByText('قیمت')[0]!.tagName).toBe('DT');
    fireEvent.click(screen.getByRole('button', { name: 'نمایش بیشتر' }));
    fireEvent.click(screen.getByRole('button', { name: 'نمایش بیشتر' }));
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-setsize', '45');
    expect(screen.getAllByRole('article').length).toBeLessThan(45);
    expect(screen.getByText('همهٔ ۴۵ کالا نمایش داده شد')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

describe('DataGrid presentation', () => {
  it.each(['desktop', 'mobile'] as const)('selects the complete visible group on %s', (viewport) => {
    render(
      <ViewportProvider forced={viewport}>
        <Grid rows={ROWS.slice(0, 3)} isRowSelectable={(row) => row.id !== 'r2'} />
      </ViewportProvider>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]!);
    expect(screen.getByRole('checkbox', { name: 'انتخاب کالا 1' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'انتخاب کالا 2' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'انتخاب کالا 2' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'انتخاب کالا 3' })).toBeChecked();
    expect(checkboxes[0]).toBeChecked();
  });
  it.each([
    ['desktop', 'pages'],
    ['mobile', 'infinite'],
  ] as const)('reports %s as %s to the source', (viewport, presentation) => {
    const present = vi.fn();
    function Spy() {
      const local = useLocalList<Row, 'title' | 'price'>(ROWS);
      const source: ListSource<Row, null, 'title' | 'price'> = { ...local, present };
      return (
        <DataGrid source={source} columns={COLUMNS} getRowId={rowId} getRowLabel={rowLabel} label="فهرست" />
      );
    }
    render(
      <ViewportProvider forced={viewport}>
        <Spy />
      </ViewportProvider>,
    );
    expect(present).toHaveBeenCalledWith(presentation);
  });
});
