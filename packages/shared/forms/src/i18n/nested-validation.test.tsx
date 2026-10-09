import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '@dukani/i18n';
import { s } from '../schema';
import { useLocalizedAppForm } from './use-localized-app-form';
import { useValidationRules } from './use-validation-rules';

function NestedForm() {
  const rules = useValidationRules();
  const form = useLocalizedAppForm({
    schema: s.object({ rows: s.array(s.object({ type: rules.iranMobile() })) }),
    defaultValues: { rows: [{ type: '' }] },
  });
  return (
    <>
      <form.Field name="rows.0.type">
        {(field) => (
          <>
            <input
              aria-label="nested"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
            />
            <span data-testid="nested-error">{field.message}</span>
          </>
        )}
      </form.Field>
      <span data-testid="dirty">{String(form.formState.isDirty)}</span>
    </>
  );
}
describe('nested form validation', () => {
  it('handles a field named type inside an array and preserves dirty state', async () => {
    const view = render(
      <I18nProvider locale="fa" messages={{}}>
        <NestedForm />
      </I18nProvider>,
    );
    await act(async () => fireEvent.change(screen.getByLabelText('nested'), { target: { value: '0812' } }));
    expect(screen.getByTestId('nested-error').textContent).toMatch(/موبایل/);
    await act(async () =>
      view.rerender(
        <I18nProvider locale="en" messages={{}}>
          <NestedForm />
        </I18nProvider>,
      ),
    );
    expect(screen.getByTestId('nested-error').textContent).toMatch(/mobile/i);
    expect(screen.getByTestId('dirty')).toHaveTextContent('true');
    expect(screen.getByLabelText('nested')).toHaveValue('0812');
  });
});
