import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { s } from './schema';
import { useAppForm, useFormAutosave } from './adapters/react-hook-form';
import { FORM_AUTOSAVE_DELAY_MS } from './adapters/react-hook-form/use-form-autosave.constants';

const schema = s.object({ name: s.string(), note: s.string() });
let hostRenders = 0;

function DraftForm({ save, enabled = true }: { save: (draft: { name: string }) => void; enabled?: boolean }) {
  hostRenders++;
  const form = useAppForm({ schema, defaultValues: { name: 'دکان', note: '' } });
  useFormAutosave(form, { select: (v) => ({ name: v.name }), save, enabled });
  return (
    <form>
      <form.Field name="name">
        {(f) => <input aria-label="name" value={f.value} onChange={(e) => f.onChange(e.target.value)} />}
      </form.Field>
      <form.Field name="note">
        {(f) => <input aria-label="note" value={f.value} onChange={(e) => f.onChange(e.target.value)} />}
      </form.Field>
    </form>
  );
}

const type = (label: string, values: readonly string[]) => {
  for (const value of values) fireEvent.change(screen.getByLabelText(label), { target: { value } });
};

describe('useFormAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    hostRenders = 0;
  });
  afterEach(() => vi.useRealTimers());

  it('saves once after a quiet period and does not re-render the form host while typing', () => {
    const save = vi.fn();
    render(<DraftForm save={save} />);
    const afterMount = hostRenders;
    type('name', ['دکانِ', 'دکانِ م', 'دکانِ مه', 'دکانِ مهتاب']);
    expect(save).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(FORM_AUTOSAVE_DELAY_MS));
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ name: 'دکانِ مهتاب' });
    expect(hostRenders - afterMount).toBeLessThanOrEqual(1); // the dirty flip only
  });

  it('flushes pending input on unmount and never saves what the draft already has', () => {
    const save = vi.fn();
    const view = render(<DraftForm save={save} />);
    type('note', ['یادداشت']); // outside the selected draft: nothing to save
    act(() => vi.advanceTimersByTime(FORM_AUTOSAVE_DELAY_MS));
    expect(save).not.toHaveBeenCalled();
    type('name', ['دکان نو']);
    view.unmount();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ name: 'دکان نو' });
  });

  it('does not save while disabled', () => {
    const save = vi.fn();
    const view = render(<DraftForm save={save} enabled={false} />);
    type('name', ['قفل']);
    act(() => vi.advanceTimersByTime(FORM_AUTOSAVE_DELAY_MS));
    view.unmount();
    expect(save).not.toHaveBeenCalled();
  });
});
