import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { rules, s } from './schema';
import { useAppForm, useFieldValue } from './adapters/react-hook-form';
import type { AppForm } from './types';

const schema = s.object({ title: rules.requiredText('عنوان کالا', 20), note: s.string() });
type In = { title: string; note: string };
let hostRenders = 0;
let previewRenders = 0;

function Preview({ form }: { form: AppForm<In, In> }) {
  previewRenders++;
  return <output aria-label="preview">{useFieldValue(form, 'title')}</output>;
}

function LeafForm({ readValidity = false }: { readValidity?: boolean }) {
  hostRenders++;
  const form = useAppForm({ schema, defaultValues: { title: '', note: '' } });
  return (
    <form onSubmit={form.handleSubmit(() => undefined)}>
      <form.Field name="title">
        {(f) => <input aria-label="title" value={f.value} onChange={(e) => f.onChange(e.target.value)} />}
      </form.Field>
      <form.Value name="title">{(title) => <p aria-label="echo">{title}</p>}</form.Value>
      <form.Status>{(state) => <p aria-label="status">{state.isValid ? 'valid' : 'invalid'}</p>}</form.Status>
      {readValidity ? <p aria-label="host">{form.formState.isValid ? 'valid' : 'invalid'}</p> : null}
      <Preview form={form} />
    </form>
  );
}

describe('form subscriptions stay in leaf components', () => {
  it('typing re-renders the leaf subscribers on every key but the form host at most once (dirty flips)', async () => {
    hostRenders = 0;
    previewRenders = 0;
    render(<LeafForm />);
    const hostAfterMount = hostRenders;
    const input = screen.getByLabelText('title');
    for (const value of ['خ', 'خو', 'خود', 'خودکار']) fireEvent.change(input, { target: { value } });
    await waitFor(() => expect(screen.getByLabelText('status')).toHaveTextContent('valid'));
    expect(screen.getByLabelText('echo')).toHaveTextContent('خودکار');
    expect(screen.getByLabelText('preview')).toHaveTextContent('خودکار');
    expect(previewRenders).toBeGreaterThanOrEqual(5);
    expect(hostRenders - hostAfterMount).toBeLessThanOrEqual(1);
  });

  it('a host that reads formState.isValid still follows validity (lazy subscription)', async () => {
    render(<LeafForm readValidity />);
    expect(screen.getByLabelText('host')).toHaveTextContent('invalid');
    fireEvent.change(screen.getByLabelText('title'), { target: { value: 'دفتر' } });
    await waitFor(() => expect(screen.getByLabelText('host')).toHaveTextContent('valid'));
  });
});
