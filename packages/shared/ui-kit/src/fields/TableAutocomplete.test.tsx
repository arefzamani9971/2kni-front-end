import { describe, expect, it, vi } from 'vitest';
import { render } from '@dukani/i18n/testing';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { useState } from 'react';
import { ViewportProvider, type Viewport } from '../responsive/viewport';
import { TableAutocomplete } from './TableAutocomplete';
import type { AutocompleteStatus, TableAutocompleteProps } from './TableAutocomplete.types';

type Item = { id: string; title: string; barcode: string | null; price: string | null };
const items: Item[] = [
  { id: 'a', title: 'خودکار آبی', barcode: '6261234567890', price: '10000' },
  { id: 'b', title: 'خودکار قرمز', barcode: null, price: null },
  { id: 'c', title: 'خودکار سبز', barcode: '6261234567892', price: '12000' },
];

function Harness({
  viewport,
  status = 'results',
  onSelect,
  onQueryChange,
  onRetry,
  disabledIds = [],
}: {
  viewport: Viewport;
  status?: AutocompleteStatus;
  onSelect: (item: Item) => void;
  onQueryChange?: (q: string) => void;
  onRetry?: () => void;
  disabledIds?: string[];
}) {
  const [query, setQuery] = useState('خود');
  const props: TableAutocompleteProps<Item> = {
    label: 'جست‌وجوی کالا',
    query,
    onQueryChange: (q) => {
      setQuery(q);
      onQueryChange?.(q);
    },
    items: status === 'results' ? items : [],
    getItemKey: (item) => item.id,
    getItemLabel: (item) => item.title,
    getOptionLabel: (item) => [item.title, item.barcode ?? '—', item.price ?? 'بدون قیمت'].join('، '),
    isItemDisabled: (item) => disabledIds.includes(item.id),
    columns: [
      { key: 'title', header: 'کالا', render: (item) => item.title, width: 'minmax(0,2fr)' },
      { key: 'barcode', header: 'بارکد', render: (item) => <bdi>{item.barcode ?? '—'}</bdi> },
      { key: 'price', header: 'قیمت فروش', render: (item) => item.price ?? 'قیمت ثبت نشده', align: 'end' },
    ],
    onSelect,
    status,
    onRetry,
  };
  return (
    <ViewportProvider forced={viewport}>
      <TableAutocomplete {...props} />
    </ViewportProvider>
  );
}

describe('table autocomplete (shared controller)', () => {
  it('desktop: column rows in a floating listbox, arrows skip a disabled option and Enter chooses once', async () => {
    const select = vi.fn();
    const user = userEvent.setup();
    render(<Harness viewport="desktop" onSelect={select} disabledIds={['b']} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getByRole('listbox')).toBeVisible();
    expect(screen.getAllByRole('option')[0]).toHaveAccessibleName('خودکار آبی، 6261234567890، 10000');
    expect(screen.getByText('قیمت ثبت نشده')).toBeVisible();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[2]!.id);
    await user.keyboard('{Enter}');
    expect(select).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith(items[2]);
    expect(input).toHaveFocus();
    expect(screen.queryByRole('listbox')).toBeNull();
    const result = await axe.run(document.body, {
      rules: { region: { enabled: false }, 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it('desktop: Enter without an active option guesses nothing; Escape closes without a choice', async () => {
    const select = vi.fn();
    const user = userEvent.setup();
    render(<Harness viewport="desktop" onSelect={select} />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Enter}{Escape}');
    expect(select).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('shows the minimum hint, loading and an error with retry instead of an empty list', async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    const view = render(<Harness viewport="desktop" status="belowMinimum" onSelect={() => {}} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText(/حداقل ۳ نویسه/)).toBeVisible();
    view.unmount();
    render(<Harness viewport="desktop" status="error" onSelect={() => {}} onRetry={retry} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'تلاش دوباره' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('mobile: a touch opens the full-screen search with the query kept; X closes without a choice and returns focus', async () => {
    const select = vi.fn();
    const user = userEvent.setup();
    render(<Harness viewport="mobile" onSelect={select} />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();
    expect(screen.getByRole('combobox')).toHaveValue('خود');
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'بستن جست‌وجو' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(select).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('mobile: a tap on a card chooses once and closes', async () => {
    const select = vi.fn();
    const user = userEvent.setup();
    render(<Harness viewport="mobile" onSelect={select} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: /خودکار قرمز/ }));
    expect(select).toHaveBeenCalledWith(items[1]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('mobile: system Back closes the layer instead of leaving the page', async () => {
    const user = userEvent.setup();
    render(<Harness viewport="mobile" onSelect={() => {}} />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('dialog');
    await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
    act(() => {
      window.history.back();
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('IME composition does not reach the query until it ends', async () => {
    const change = vi.fn();
    render(<Harness viewport="desktop" onSelect={() => {}} onQueryChange={change} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'خودک' } });
    expect(change).not.toHaveBeenCalled();
    expect(input).toHaveValue('خودک');
    fireEvent.compositionEnd(input, { target: { value: 'خودکا' } });
    expect(change).toHaveBeenCalledWith('خودکا');
  });
});
