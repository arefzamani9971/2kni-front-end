import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { rules, s } from './schema';
import { useAppForm } from './adapters/react-hook-form';

const schema = s.object({ mobile: rules.iranMobile(), title: rules.requiredText('عنوان کالا', 20), price: rules.money() });

function TestForm({ onValid }: { onValid: (v: unknown) => void }) {
  const form = useAppForm({ schema, defaultValues: { mobile: '', title: '', price: '' } });
  return (
    <form onSubmit={form.handleSubmit(onValid)}>
      <form.Field name="mobile">
        {(f) => (
          <>
            <input aria-label="mobile" id={f.id} value={f.value} onChange={(e) => f.onChange(e.target.value)} onBlur={f.onBlur} />
            {f.message ? <p role="alert">{f.message}</p> : null}
          </>
        )}
      </form.Field>
      <form.Field name="title">
        {(f) => <input aria-label="title" value={f.value} onChange={(e) => f.onChange(e.target.value)} />}
      </form.Field>
      <form.Field name="price">
        {(f) => <input aria-label="price" value={f.value} onChange={(e) => f.onChange(e.target.value)} />}
      </form.Field>
      <button type="submit">ثبت</button>
    </form>
  );
}

describe('useAppForm', () => {
  it('validates from the first change and parses on submit', async () => {
    const onValid = vi.fn();
    render(<TestForm onValid={onValid} />);
    await act(async () => fireEvent.change(screen.getByLabelText('mobile'), { target: { value: '0812' } }));
    expect(await screen.findByRole('alert')).toHaveTextContent('شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.');

    await act(async () => {
      fireEvent.change(screen.getByLabelText('mobile'), { target: { value: '۰۹۱۲۳۴۵۶۷۸۹' } });
      fireEvent.change(screen.getByLabelText('title'), { target: { value: ' خودكار  بيك ' } });
      fireEvent.change(screen.getByLabelText('price'), { target: { value: '۱۲٬۵۰۰' } });
    });
    await act(async () => fireEvent.click(screen.getByText('ثبت')));
    expect(onValid).toHaveBeenCalledWith({ mobile: '09123456789', title: 'خودکار بیک', price: { amount: '12500' } });
  });
});
