import { fireEvent, render, screen } from '@testing-library/react';
import { useState, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { CardNumberField, ShebaField } from './grouped-fields';
import { IranMobileField, OtpField } from './identity-fields';
import { MoneyField, QuantityField } from './number-fields';
import { TextField } from './TextField';

type FieldLike = (p: { label: string; value: string; onChange: (v: string) => void }) => ReactElement;

function Controlled({ Cmp, initial = '' }: { Cmp: FieldLike; initial?: string }) {
  const [v, setV] = useState(initial);
  return (
    <>
      <Cmp label="field" value={v} onChange={setV} />
      <output data-testid="value">{v}</output>
    </>
  );
}

const input = () => screen.getByLabelText(/field|شماره|کد|مبلغ|مقدار/);

describe('TextField filters', () => {
  it('rejects a forbidden character, keeps the previous value and explains why', () => {
    render(<Controlled Cmp={(p) => <TextField {...p} filter="digits" />} initial="12" />);
    fireEvent.change(input(), { target: { value: '12a' } });
    expect(screen.getByTestId('value').textContent).toBe('12');
    expect(screen.getByText('فقط رقم وارد کنید.')).toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(input(), { target: { value: '123' } });
    expect(screen.queryByText('فقط رقم وارد کنید.')).not.toBeInTheDocument();
  });

  it('accepts only Persian letters with the persian-letters filter', () => {
    render(<Controlled Cmp={(p) => <TextField {...p} filter="persian-letters" />} />);
    fireEvent.change(input(), { target: { value: 'مریم' } });
    fireEvent.change(input(), { target: { value: 'مریمA' } });
    expect(screen.getByTestId('value').textContent).toBe('مریم');
    expect(screen.getByText('فقط حروف فارسی وارد کنید.')).toBeInTheDocument();
  });

  it('links the message with aria-describedby and shows status icons for warnings', () => {
    render(<TextField label="field" status="warning" message="هشدار" />);
    const describedBy = input().getAttribute('aria-describedby');
    expect(document.getElementById(describedBy!)).toHaveTextContent('هشدار');
  });
});

describe('IranMobileField / OtpField', () => {
  it('normalizes Persian digits and a +98 paste to 09…', () => {
    render(<Controlled Cmp={(p) => <IranMobileField {...p} label="شماره" />} />);
    fireEvent.change(input(), { target: { value: '+98 912 345 6789' } });
    expect(screen.getByTestId('value').textContent).toBe('09123456789');
    fireEvent.change(input(), { target: { value: '۰۹۱۲' } });
    expect(screen.getByTestId('value').textContent).toBe('0912');
  });

  it('never strips letters from a mobile number', () => {
    render(<Controlled Cmp={(p) => <IranMobileField {...p} label="شماره" />} initial="0912" />);
    fireEvent.change(input(), { target: { value: '0912abc456789' } });
    expect(screen.getByTestId('value').textContent).toBe('0912');
  });

  it('OTP keeps the leading zero and uses one-time-code autofill', () => {
    render(<Controlled Cmp={(p) => <OtpField {...p} label="کد" />} />);
    fireEvent.change(input(), { target: { value: ' ۰۱۲۳۴۵ ' } });
    expect(screen.getByTestId('value').textContent).toBe('012345');
    expect(input()).toHaveAttribute('autocomplete', 'one-time-code');
  });
});

describe('number fields', () => {
  it('money groups thousands for display and emits the canonical value', () => {
    render(<Controlled Cmp={(p) => <MoneyField {...p} label="مبلغ" />} />);
    fireEvent.change(input(), { target: { value: '۱۲۵۰۰۰' } });
    expect(screen.getByTestId('value').textContent).toBe('125000');
    expect((input() as HTMLInputElement).value).toBe('۱۲۵٬۰۰۰');
  });

  it('count quantities reject decimals, weight quantities accept up to maxDecimals', () => {
    const { unmount } = render(<Controlled Cmp={(p) => <QuantityField {...p} label="مقدار" />} initial="3" />);
    fireEvent.change(input(), { target: { value: '3.5' } });
    expect(screen.getByTestId('value').textContent).toBe('3');
    expect(screen.getByText('عدد اعشاری مجاز نیست.')).toBeInTheDocument();
    unmount();
    render(<Controlled Cmp={(p) => <QuantityField {...p} label="مقدار" maxDecimals={3} />} />);
    fireEvent.change(input(), { target: { value: '۱٫۵' } });
    expect(screen.getByTestId('value').textContent).toBe('1.5');
  });
});

describe('grouped fields', () => {
  it('card number is grouped 4-4-4-4 with raw digits as value', () => {
    render(<Controlled Cmp={(p) => <CardNumberField {...p} label="شماره" />} />);
    fireEvent.change(input(), { target: { value: '6037997599201236' } });
    expect((input() as HTMLInputElement).value).toBe('۶۰۳۷ ۹۹۷۵ ۹۹۲۰ ۱۲۳۶');
    expect(screen.getByTestId('value').textContent).toBe('6037997599201236');
  });

  it('sheba emits IR + 24 digits', () => {
    render(<Controlled Cmp={(p) => <ShebaField {...p} label="شماره" />} />);
    fireEvent.change(input(), { target: { value: '062960000000100324200001' } });
    expect(screen.getByTestId('value').textContent).toBe('IR062960000000100324200001');
  });
});
