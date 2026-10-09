import axe from 'axe-core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { formatJalali, type DateOnly } from '@dukani/domain';
import { ViewportProvider } from '../responsive/viewport';
import { DateField } from './DateField';
import { JalaliCalendar } from './JalaliCalendar';

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const initial = '2026-09-27' as DateOnly;
function Field({
  min,
  max,
  viewport = 'desktop',
  disabled,
  isDisabled,
}: {
  min?: DateOnly;
  max?: DateOnly;
  viewport?: 'mobile' | 'desktop';
  disabled?: boolean;
  isDisabled?: (value: DateOnly) => boolean;
}) {
  const [value, setValue] = useState<DateOnly | ''>(initial);
  return (
    <ViewportProvider forced={viewport}>
      <DateField
        label="تاریخ"
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        disabled={disabled}
        isDisabled={isDisabled}
        required
      />
      <output data-testid="committed">{value}</output>
    </ViewportProvider>
  );
}

describe('DateField confirmation contract', () => {
  it('derives validation from changing constraints instead of caching a stale error', () => {
    const { rerender } = render(<Field min={initial} max={initial} />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '1405/07/06' } });
    expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeDisabled();
    rerender(<Field />);
    expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeEnabled();
    rerender(<Field isDisabled={() => true} />);
    expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeDisabled();
    expect(screen.getByLabelText('تاریخ (سال/ماه/روز)')).toHaveAttribute('aria-invalid', 'true');
  });
  it('ends an open session when disabled without reopening it when enabled', () => {
    const { rerender } = render(<Field />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    rerender(<Field disabled />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Field />);
    expect(screen.getByRole('button', { name: 'تاریخ' })).toHaveAttribute('aria-expanded', 'false');
  });
  it('accepts Arabic digits as well as Persian and Latin input', () => {
    render(<Field />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '١٤٠٥/٠٧/٠٦' } });
    fireEvent.click(screen.getByRole('button', { name: 'تأیید تاریخ' }));
    expect(screen.getByTestId('committed')).toHaveTextContent('2026-09-28');
  });
  it('retains a draft across presentations and returns focus after cancelling the mobile sheet', async () => {
    const { rerender } = render(<Field />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '1405/07/06' } });
    rerender(<Field viewport="mobile" />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'روز' })).toHaveAttribute('aria-valuenow', '6');
    await waitFor(() =>
      expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement),
    );
    fireEvent.click(screen.getByRole('button', { name: 'لغو' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'تاریخ' })).toHaveFocus());
    expect(screen.getByTestId('committed')).toHaveTextContent(initial);
  });
  it('keeps edits as a draft, discards on cancel, commits only on confirmation and restores focus', async () => {
    render(<Field />);
    const trigger = screen.getByRole('button', { name: 'تاریخ' });
    fireEvent.click(trigger);
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '1405/07/06' } });
    expect(screen.getByTestId('committed')).toHaveTextContent(initial);
    fireEvent.click(screen.getByRole('button', { name: 'لغو' }));
    await waitFor(() => expect(trigger).toHaveFocus());
    fireEvent.click(trigger);
    expect(screen.getByLabelText('تاریخ (سال/ماه/روز)')).toHaveValue(formatJalali(initial));
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '1405/07/06' } });
    fireEvent.click(screen.getByRole('button', { name: 'تأیید تاریخ' }));
    expect(screen.getByTestId('committed')).toHaveTextContent('2026-09-28');
  });

  it('validates typed dates and today against min/max, including incomplete input', () => {
    render(<Field min={initial} max={initial} />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    const input = screen.getByLabelText('تاریخ (سال/ماه/روز)');
    fireEvent.change(input, { target: { value: '1405/07/06' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'امروز' })).toBeDisabled();
    fireEvent.change(input, { target: { value: '1405/' } });
    expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeDisabled();
    expect(screen.getByTestId('committed')).toHaveTextContent(initial);
  });

  it('dismisses with Escape without committing', async () => {
    render(<Field />);
    const trigger = screen.getByRole('button', { name: 'تاریخ' });
    fireEvent.click(trigger);
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '1405/07/06' } });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(screen.getByTestId('committed')).toHaveTextContent(initial);
  });
});

describe('Mobile date wheels', () => {
  it('preserves a pending day gesture when another column clamps the previously selected day', async () => {
    const { rerender } = render(<Field />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '1405/06/31' } });
    rerender(<Field viewport="mobile" />);
    const day = screen.getByRole('spinbutton', { name: 'روز' });
    fireEvent.scroll(screen.getByRole('spinbutton', { name: 'ماه' }), { target: { scrollTop: 6 * 48 } });
    fireEvent.scroll(day, { target: { scrollTop: 19 * 48 } });
    await waitFor(() => {
      expect(day).toHaveAttribute('aria-valuenow', '20');
      expect(screen.getByRole('spinbutton', { name: 'ماه' })).toHaveAttribute('aria-valuenow', '7');
    });
  });
  it('merges independently settling columns into the latest draft', async () => {
    render(<Field viewport="mobile" />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    const day = screen.getByRole('spinbutton', { name: 'روز' });
    const month = screen.getByRole('spinbutton', { name: 'ماه' });
    fireEvent.scroll(day, { target: { scrollTop: 6 * 48 } });
    fireEvent.scroll(month, { target: { scrollTop: 7 * 48 } });
    await waitFor(() => {
      expect(day).toHaveAttribute('aria-valuenow', '7');
      expect(month).toHaveAttribute('aria-valuenow', '8');
    });
    fireEvent.click(screen.getByRole('button', { name: 'تأیید تاریخ' }));
    expect(screen.getByTestId('committed')).toHaveTextContent('2026-10-29');
  });
  it('explains invalid desktop text on mobile and clears the error after a wheel selection', () => {
    const { rerender } = render(<Field />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '1405/' } });
    rerender(<Field viewport="mobile" />);
    const day = screen.getByRole('spinbutton', { name: 'روز' });
    expect(screen.getByRole('alert')).not.toBeEmptyDOMElement();
    expect(day).toHaveAttribute('aria-describedby', screen.getByRole('alert').id);
    expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeDisabled();
    fireEvent.keyDown(day, { key: 'ArrowDown' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeEnabled();
  });
  it('cancels pending scroll callbacks on resize and allows confirmation in the new presentation', async () => {
    const { rerender } = render(<Field viewport="mobile" />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    fireEvent.scroll(screen.getByRole('spinbutton', { name: 'روز' }), { target: { scrollTop: 6 * 48 } });
    rerender(<Field />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeEnabled());
    expect(screen.getByLabelText('تاریخ (سال/ماه/روز)')).toHaveValue(formatJalali(initial));
    fireEvent.click(screen.getByRole('button', { name: 'تأیید تاریخ' }));
    expect(screen.getByTestId('committed')).toHaveTextContent(initial);
  });
  it('has no structural accessibility violations with the mobile sheet open', async () => {
    render(<Field viewport="mobile" />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    const result = await axe.run(document.body, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
  });
  it('changes the draft with keyboard and scrolling, commits only on confirm', async () => {
    render(<Field viewport="mobile" />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    const day = screen.getByRole('spinbutton', { name: 'روز' });
    fireEvent.keyDown(day, { key: 'ArrowDown' });
    expect(day).toHaveAttribute('aria-valuenow', '6');
    expect(screen.getByTestId('committed')).toHaveTextContent(initial);
    fireEvent.scroll(day, { target: { scrollTop: 6 * 48 } });
    expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeDisabled();
    await waitFor(() => expect(day).toHaveAttribute('aria-valuenow', '7'));
    fireEvent.click(screen.getByRole('button', { name: 'تأیید تاریخ' }));
    expect(screen.getByTestId('committed')).toHaveTextContent('2026-09-29');
  });
  it('clamps day 31 when moving from Shahrivar to Mehr, preserving the draft on resize', () => {
    const { rerender } = render(<Field />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '1405/06/31' } });
    rerender(<Field viewport="mobile" />);
    fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'ماه' }), { key: 'ArrowDown' });
    expect(screen.getByRole('spinbutton', { name: 'روز' })).toHaveAttribute('aria-valuenow', '30');
    expect(screen.getByRole('status')).toHaveTextContent('روز به ۳۰ اصلاح شد.');
    rerender(<Field />);
    expect(screen.getByLabelText('تاریخ (سال/ماه/روز)')).toHaveValue(formatJalali('2026-10-22' as DateOnly));
  });
  it('clamps Esfand when leaving a leap year', () => {
    const { rerender } = render(<Field />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    fireEvent.change(screen.getByLabelText('تاریخ (سال/ماه/روز)'), { target: { value: '1403/12/30' } });
    rerender(<Field viewport="mobile" />);
    fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'سال' }), { key: 'ArrowDown' });
    expect(screen.getByRole('spinbutton', { name: 'روز' })).toHaveAttribute('aria-valuenow', '29');
  });
  it('prevents confirming unavailable dates and discards them on Escape', async () => {
    render(<Field viewport="mobile" min={initial} max={initial} />);
    fireEvent.click(screen.getByRole('button', { name: 'تاریخ' }));
    fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'روز' }), { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: 'تأیید تاریخ' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('این تاریخ قابل انتخاب نیست.');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'تاریخ' })).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(screen.getByTestId('committed')).toHaveTextContent(initial);
  });
});

describe('JalaliCalendar keyboard', () => {
  it('uses one tab stop, moves in RTL and browses months without selecting', () => {
    const onChange = vi.fn();
    render(<JalaliCalendar mode="single" value={initial} onChange={onChange} />);
    const grid = screen.getByRole('grid');
    const day = (date: string) =>
      screen.getByRole('button', { name: formatJalali(date as DateOnly, 'EEEE d MMMM yyyy') });
    expect(grid.querySelectorAll('button[tabindex="0"]')).toHaveLength(1);
    day(initial).focus();
    fireEvent.keyDown(day(initial), { key: 'ArrowLeft' });
    expect(day('2026-09-28')).toHaveFocus();
    fireEvent.keyDown(day('2026-09-28'), { key: 'PageDown' });
    expect(day('2026-10-28')).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('announces disabled dates while preventing selection', () => {
    const onChange = vi.fn();
    render(
      <JalaliCalendar
        mode="single"
        value={initial}
        onChange={onChange}
        isDisabled={(date) => date === initial}
      />,
    );
    const day = screen.getByRole('button', { name: formatJalali(initial, 'EEEE d MMMM yyyy') });
    expect(day).toHaveAttribute('aria-disabled', 'true');
    expect(day).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(day);
    expect(onChange).not.toHaveBeenCalled();
  });
});
