import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
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

/** A draft that also keeps state outside the form (rows), reported with `schedule()`. */
function RowsForm({ save }: { save: (draft: { name: string; rows: number }) => void }) {
  const form = useAppForm({ schema, defaultValues: { name: 'دکان', note: '' } });
  const [rows, setRows] = useState(0);
  const autosave = useFormAutosave(form, { select: (v) => ({ name: v.name, rows }), save });
  const { schedule } = autosave;
  useEffect(() => schedule(), [schedule, rows]);
  return (
    <button type="button" onClick={() => setRows((n) => n + 1)}>
      row
    </button>
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

  it('saves the first change at once and the rest of the burst once, without re-rendering the form host', () => {
    const save = vi.fn();
    render(<DraftForm save={save} />);
    const afterMount = hostRenders;
    type('name', ['دکانِ', 'دکانِ م', 'دکانِ مه', 'دکانِ مهتاب']);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenLastCalledWith({ name: 'دکانِ' });
    act(() => vi.advanceTimersByTime(FORM_AUTOSAVE_DELAY_MS));
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith({ name: 'دکانِ مهتاب' });
    expect(hostRenders - afterMount).toBeLessThanOrEqual(1); // the dirty flip only
  });

  it('flushes pending input on unmount and when the page is left; never saves what the draft already has', () => {
    const save = vi.fn();
    const view = render(<DraftForm save={save} />);
    type('note', ['یادداشت']); // outside the selected draft: nothing to save
    act(() => vi.advanceTimersByTime(FORM_AUTOSAVE_DELAY_MS));
    expect(save).not.toHaveBeenCalled();
    type('name', ['دکان نو', 'دکان نوی']);
    window.dispatchEvent(new Event('pagehide'));
    expect(save).toHaveBeenLastCalledWith({ name: 'دکان نوی' });
    type('name', ['دکان نوین']);
    view.unmount();
    expect(save).toHaveBeenLastCalledWith({ name: 'دکان نوین' });
    expect(save).toHaveBeenCalledTimes(3);
  });

  it('does not save while disabled', () => {
    const save = vi.fn();
    const view = render(<DraftForm save={save} enabled={false} />);
    type('name', ['قفل']);
    act(() => vi.advanceTimersByTime(FORM_AUTOSAVE_DELAY_MS));
    view.unmount();
    expect(save).not.toHaveBeenCalled();
  });

  it('schedule() saves state kept outside the form', () => {
    const save = vi.fn();
    render(<RowsForm save={save} />);
    expect(save).not.toHaveBeenCalled(); // mount: the draft already has it
    fireEvent.click(screen.getByRole('button', { name: 'row' }));
    expect(save).toHaveBeenLastCalledWith({ name: 'دکان', rows: 1 });
  });
});
