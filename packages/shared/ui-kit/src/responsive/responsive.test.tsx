import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { OptionList } from '../fields/OptionList';
import { SelectField } from '../fields/SelectField';
import { ConfirmDialog } from '../overlays/ConfirmDialog';
import { createAdaptive, useByViewport } from './adaptive';
import { ViewportProvider, type Viewport } from './viewport';

beforeAll(() => {
  // Radix Popper measures its anchor; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const Probe = createAdaptive<{ label: string }>('Probe', {
  mobile: ({ label }) => <p>sheet:{label}</p>,
  desktop: ({ label }) => <p>dialog:{label}</p>,
});

function Columns() {
  return <output>{useByViewport({ mobile: 1, desktop: 3 })}</output>;
}

describe('createAdaptive (Strategy + multiplexer)', () => {
  it('renders the mobile strategy when nothing says otherwise (SSR-safe default)', () => {
    render(<Probe label="x" />);
    expect(screen.getByText('sheet:x')).toBeInTheDocument();
  });

  it('passes the same props to the strategy chosen by the provider and mirrors it to <html>', () => {
    render(
      <ViewportProvider forced="desktop">
        <Probe label="x" />
        <Columns />
      </ViewportProvider>,
    );
    expect(screen.getByText('dialog:x')).toBeInTheDocument();
    expect(screen.getByRole('status').textContent).toBe('3');
    expect(document.documentElement.getAttribute('data-viewport')).toBe('desktop');
  });

  it('keeps caller state when the viewport changes (strategies are stateless renderers)', () => {
    function Host({ vp }: { vp: Viewport }) {
      const [n, setN] = useState(0);
      return (
        <ViewportProvider forced={vp}>
          <button onClick={() => setN(n + 1)}>inc</button>
          <Probe label={String(n)} />
        </ViewportProvider>
      );
    }
    const { rerender } = render(<Host vp="mobile" />);
    fireEvent.click(screen.getByText('inc'));
    rerender(<Host vp="desktop" />);
    expect(screen.getByText('dialog:1')).toBeInTheDocument();
  });
});

describe('OptionList (Figma Option Item)', () => {
  const options = [
    { value: 'a', label: 'نوشت‌افزار' },
    { value: 'b', label: 'آرایشی', disabled: true },
    { value: 'c', label: 'سایر' },
  ];

  it('marks the selection with aria-selected and a single tab stop on it', () => {
    render(<OptionList options={options} value="c" onSelect={() => undefined} label="نوع" />);
    const selected = screen.getByRole('option', { name: 'سایر' });
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('option', { name: 'نوشت‌افزار' })).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus with arrows (skipping disabled) and selects with Enter; hover/click on disabled does nothing', () => {
    const onSelect = vi.fn();
    render(<OptionList options={options} onSelect={onSelect} label="نوع" />);
    const first = screen.getByRole('option', { name: 'نوشت‌افزار' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('option', { name: 'سایر' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('c');
    fireEvent.click(screen.getByRole('option', { name: 'آرایشی' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('SelectField on desktop (anchored listbox)', () => {
  it('opens a listbox attached to the field, selects, closes and keeps one contract', () => {
    function Host() {
      const [v, setV] = useState<'a' | 'c' | ''>('');
      return (
        <ViewportProvider forced="desktop">
          <SelectField
            label="نوع فروشگاه"
            value={v}
            onChange={setV}
            options={[
              { value: 'a', label: 'نوشت‌افزار' },
              { value: 'c', label: 'سایر' },
            ]}
          />
        </ViewportProvider>
      );
    }
    render(<Host />);
    const trigger = screen.getByLabelText('نوع فروشگاه');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'سایر' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger.textContent).toBe('سایر');
  });
});

describe('ConfirmDialog through Overlay', () => {
  it('is a dialog with both actions in DOM order (primary first) on desktop', () => {
    render(
      <ViewportProvider forced="desktop">
        <ConfirmDialog open onOpenChange={() => undefined} title="لغو سفارش ۲۰۵۱؟" confirmLabel="لغو سفارش" destructive onConfirm={() => undefined} />
      </ViewportProvider>,
    );
    const dialog = screen.getByRole('dialog', { name: 'لغو سفارش ۲۰۵۱؟' });
    const buttons = Array.from(dialog.querySelectorAll('button')).map((b) => b.textContent);
    expect(buttons).toEqual(['لغو سفارش', 'انصراف']);
  });
});
