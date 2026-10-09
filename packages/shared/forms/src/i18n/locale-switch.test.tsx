import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '@dukani/i18n';
import { s } from '../schema';
import { useLocalizedAppForm } from './use-localized-app-form';
import { useValidationRules } from './use-validation-rules';

function Example() {
  const rules = useValidationRules();
  const form = useLocalizedAppForm({
    schema: s.object({ mobile: rules.iranMobile(), email: rules.optional.email() }),
    defaultValues: { mobile: '', email: '' },
  });
  return (
    <>
      <form.Field name="mobile">
        {(f) => (
          <>
            <input aria-label="mobile" value={f.value} onChange={(e) => f.onChange(e.target.value)} />
            <span data-testid="message">{f.message}</span>
          </>
        )}
      </form.Field>
      <form.Field name="email">{(f) => <span data-testid="server">{f.message}</span>}</form.Field>
      <button onClick={() => form.setFieldError('email', 'Server response')}>server</button>
    </>
  );
}

describe('form locale changes', () => {
  it('refreshes existing schema errors without resetting the draft or manual errors', async () => {
    const view = render(
      <I18nProvider locale="fa" messages={{}}>
        <Example />
      </I18nProvider>,
    );
    await act(async () => fireEvent.change(screen.getByLabelText('mobile'), { target: { value: '0812' } }));
    expect(screen.getByTestId('message').textContent).toMatch(/موبایل/);
    fireEvent.click(screen.getByText('server'));
    await act(async () =>
      view.rerender(
        <I18nProvider locale="en" messages={{}}>
          <Example />
        </I18nProvider>,
      ),
    );
    expect(screen.getByTestId('message').textContent).toMatch(/mobile/i);
    expect(screen.getByLabelText('mobile')).toHaveValue('0812');
    expect(screen.getByTestId('server')).toHaveTextContent('Server response');
  });
});
