import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from '@dukani/i18n';
import type { Dto } from '@dukani/contracts';
import { TotalsFields } from '../components/TotalsFields';
import { useTotalsForm } from '../hooks/use-totals-form';

it('isolates repeated amount typing from the form owner and parses amounts with the shared schema', async () => {
  let renders = 0;
  const submit = vi.fn();
  function Form() {
    renders++;
    const form = useTotalsForm({
      discountAmount: '0',
      shippingAmount: '0',
      nonRecoverableTaxAmount: '0',
    } as Dto<'PurchaseDto'>);
    return (
      <>
        <TotalsFields form={form} disabled={false} />
        <button onClick={() => void form.handleSubmit(submit)()}>Submit</button>
      </>
    );
  }
  render(
    <I18nProvider locale="en" messages={{}}>
      <Form />
    </I18nProvider>,
  );
  const inputs = screen.getAllByRole('textbox');
  fireEvent.change(inputs[0]!, { target: { value: '10' } });
  await waitFor(() => expect(inputs[0]).toHaveValue('10'));
  const afterDirty = renders;
  fireEvent.change(inputs[0]!, { target: { value: '20' } });
  await waitFor(() => expect(inputs[0]).toHaveValue('20'));
  expect(renders).toBe(afterDirty);
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(submit).toHaveBeenCalledWith({
      discountAmount: '20',
      shippingAmount: '0',
      nonRecoverableTaxAmount: '0',
      invoiceTotal: '',
    }),
  );
});
