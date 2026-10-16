import { render } from '@dukani/i18n/testing';
import { act, fireEvent, renderHook, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../fields/Checkbox';
import { SearchField } from '../fields/SearchField';
import { ViewportProvider } from '../responsive';
import { FilterArea } from './FilterArea';
import { useFilterDraft } from './use-filter-draft';

type F = { q: string; inStock: boolean };

beforeAll(() => {
  // Radix Checkbox measures its bubble input inside a <form>; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
const DEFAULTS: F = { q: '', inStock: false };

function Harness({ onApplied }: { onApplied: (filter: F) => void }) {
  const [applied, setApplied] = useState<F>(DEFAULTS);
  const filter = useFilterDraft({
    applied,
    defaults: DEFAULTS,
    onApply: (next) => {
      setApplied(next);
      onApplied(next);
    },
  });
  return (
    <FilterArea
      appliedCount={filter.activeKeys.length}
      dirty={filter.dirty}
      onApply={filter.apply}
      onReset={filter.reset}
      options={
        <Checkbox
          label="فقط موجود"
          checked={filter.draft.inStock}
          onChange={(inStock) => filter.set({ inStock })}
        />
      }
      search={<SearchField label="نام کالا" value={filter.draft.q} onChange={(q) => filter.set({ q })} />}
    />
  );
}

describe('useFilterDraft', () => {
  it('keeps edits in the draft, applies them at once and keeps other edits when a chip is removed', () => {
    const onApply = vi.fn();
    const { result, rerender } = renderHook(
      ({ applied }) => useFilterDraft({ applied, defaults: DEFAULTS, onApply }),
      {
        initialProps: { applied: { q: 'pen', inStock: true } as F },
      },
    );
    expect(result.current.activeKeys).toEqual(['q', 'inStock']);
    act(() => result.current.set({ q: 'pencil' }));
    expect(result.current).toMatchObject({ dirty: true, draft: { q: 'pencil', inStock: true } });
    expect(onApply).not.toHaveBeenCalled();
    act(() => result.current.remove('inStock'));
    expect(onApply).toHaveBeenLastCalledWith({ q: 'pen', inStock: false });
    rerender({ applied: { q: 'pen', inStock: false } });
    expect(result.current.draft).toEqual({ q: 'pencil', inStock: false });
    act(() => result.current.reset());
    expect(result.current.draft).toEqual(DEFAULTS);
    act(() => result.current.apply());
    expect(onApply).toHaveBeenLastCalledWith(DEFAULTS);
  });
});

describe('FilterArea', () => {
  it('desktop: typing does not apply; the Primary «جست‌وجو» is the last action under every field', () => {
    const onApplied = vi.fn();
    render(
      <ViewportProvider forced="desktop">
        <Harness onApplied={onApplied} />
      </ViewportProvider>,
    );
    fireEvent.change(screen.getByRole('searchbox', { name: 'نام کالا' }), { target: { value: 'خودکار' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'فقط موجود' }));
    expect(onApplied).not.toHaveBeenCalled();
    expect(screen.getByText('تغییر اعمال‌نشده')).toBeInTheDocument();
    const search = screen.getByRole('button', { name: 'جست‌وجو' });
    expect(search).toHaveAttribute('type', 'submit');
    expect(search.parentElement!.lastElementChild).toBe(search);
    fireEvent.click(search);
    expect(onApplied).toHaveBeenCalledWith({ q: 'خودکار', inStock: true });
    expect(screen.getByText('۲ فیلتر فعال')).toBeInTheDocument();
  });

  it('desktop: collapsing neither applies nor clears the draft', () => {
    const onApplied = vi.fn();
    render(
      <ViewportProvider forced="desktop">
        <Harness onApplied={onApplied} />
      </ViewportProvider>,
    );
    fireEvent.change(screen.getByRole('searchbox', { name: 'نام کالا' }), { target: { value: 'دفتر' } });
    const toggle = screen.getByRole('button', { name: /جست‌وجو و فیلتر/ });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(screen.getByRole('searchbox', { name: 'نام کالا' })).toHaveValue('دفتر');
    expect(onApplied).not.toHaveBeenCalled();
  });

  it('mobile: the sheet keeps unapplied edits when closed and applies on «اعمال فیلتر»', () => {
    const onApplied = vi.fn();
    render(
      <ViewportProvider forced="mobile">
        <Harness onApplied={onApplied} />
      </ViewportProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'فیلتر' }));
    const sheet = screen.getByRole('dialog');
    fireEvent.click(within(sheet).getByRole('checkbox', { name: 'فقط موجود' }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'اعمال فیلتر' }));
    expect(onApplied).toHaveBeenCalledWith({ q: '', inStock: true });
  });
});
