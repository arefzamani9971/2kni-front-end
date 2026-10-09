import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '@dukani/i18n';
import { DecimalField } from '../fields/DecimalField';
import { BarcodeField } from '../fields/BarcodeField';
import { PageState } from '../feedback/PageState';
import { JalaliDateWheels } from '../date/JalaliDateWheels';
import { toDateOnly, fromJalali } from '@dukani/domain';

describe('UI catalog ownership', () => {
  it('translates field errors when locale changes and keeps the canonical draft', () => {
    const content = <DecimalField label="Amount" defaultValue="12345678901234567890" grouping />;
    const { rerender } = render(
      <I18nProvider locale="fa" messages={{}}>
        {content}
      </I18nProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Amount' });
    fireEvent.change(input, { target: { value: '12345678901234567890.1' } });
    expect(screen.getByText('عدد اعشاری مجاز نیست.')).toBeInTheDocument();
    rerender(
      <I18nProvider locale="en" messages={{}}>
        {content}
      </I18nProvider>,
    );
    expect(screen.getByText('Decimal numbers are not allowed.')).toBeInTheDocument();
    expect(input).toHaveValue('12,345,678,901,234,567,890');
  });

  it('needs no control messages in the app provider and localizes empty states and accessible labels', () => {
    render(
      <I18nProvider locale="en" messages={{}}>
        <BarcodeField onScan={() => {}} />
        <PageState kind="permission" />
      </I18nProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Barcode' })).toHaveAttribute(
      'placeholder',
      'Enter or scan a barcode',
    );
    expect(screen.getByRole('button', { name: 'Scan barcode' })).toBeInTheDocument();
    expect(screen.getByText('Access denied')).toBeInTheDocument();
  });

  it('keeps the Jalali calendar while translating month names and wheel labels', () => {
    render(
      <I18nProvider locale="en" messages={{}}>
        <JalaliDateWheels
          value={toDateOnly(fromJalali({ year: 1405, month: 1, day: 1 }))}
          onChange={() => {}}
          onSettlingChange={() => {}}
          error={null}
          announcement=""
        />
      </I18nProvider>,
    );
    expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveAttribute('aria-valuetext', 'Farvardin');
    expect(screen.getByRole('spinbutton', { name: 'Year' })).toHaveAttribute('aria-valuenow', '1405');
  });
});
