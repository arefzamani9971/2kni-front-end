import { renderHook } from '@testing-library/react';
import type { GridColumnDefinition } from './use-grid-columns.types';
import { useGridColumns } from './use-grid-columns';

type Row = { title: string; quantity: number };
type Column = 'title' | 'quantity';
type Header = 'name' | 'count';

const DEFINITIONS = [
  { id: 'title', headerKey: 'name', card: 'title', sortField: 'title' },
  { id: 'quantity', headerKey: 'count', align: 'end', width: 'sm' },
] as const satisfies readonly GridColumnDefinition<Column, Header, 'title'>[];

const translate = (key: Header) => ({ name: 'کالا', count: 'تعداد' })[key];
const renderCell = (row: Row, id: Column) => row[id];
const options = { definitions: DEFINITIONS, translate, renderCell };

it('keeps column and renderer identities across unrelated rerenders', () => {
  const hook = renderHook(() => useGridColumns({ ...options }));
  const columns = hook.result.current;
  hook.rerender();

  expect(hook.result.current).toBe(columns);
  expect(hook.result.current[0]?.cell).toBe(columns[0]?.cell);
  expect(columns[0]?.header).toBe('کالا');
  expect(columns[0]?.card).toBe('title');
  expect(columns[0]?.sortField).toBe('title');
  expect(columns[1]?.align).toBe('end');
  expect(columns[1]?.width).toBe('sm');
  expect(columns[1]?.cell({ title: 'شیر', quantity: 3 })).toBe(3);
});

it('updates translated headers without changing row content', () => {
  const hook = renderHook((current) => useGridColumns(current), { initialProps: options });
  hook.rerender({
    ...options,
    translate: (key: Header) => ({ name: 'Product', count: 'Quantity' })[key],
  });

  expect(hook.result.current.map((column) => column.header)).toEqual(['Product', 'Quantity']);
  expect(hook.result.current[0]?.cell({ title: 'Milk', quantity: 3 })).toBe('Milk');
});

it('uses the current cell renderer when editing state changes', () => {
  const hook = renderHook((current) => useGridColumns(current), { initialProps: options });
  hook.rerender({
    ...options,
    renderCell: (row: Row, id: Column) => `edited: ${row[id]}`,
  });

  expect(hook.result.current[1]?.cell({ title: 'Milk', quantity: 4 })).toBe('edited: 4');
});

it('follows changed definitions for column order and visibility', () => {
  const initialDefinitions: readonly GridColumnDefinition<Column, Header, 'title'>[] = DEFINITIONS;
  const hook = renderHook((definitions) => useGridColumns({ ...options, definitions }), {
    initialProps: initialDefinitions,
  });
  hook.rerender([DEFINITIONS[1]]);

  expect(hook.result.current.map((column) => column.id)).toEqual(['quantity']);
  expect(hook.result.current[0]?.header).toBe('تعداد');
});
