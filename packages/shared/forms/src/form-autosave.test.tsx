import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { s } from './schema';
import { useAppForm, useFormAutosave } from './adapters/react-hook-form';
import { FORM_AUTOSAVE_DELAY_MS } from './adapters/react-hook-form/use-form-autosave.constants';

const schema = s.object({ name: s.string(), note: s.string() });
let hostRenders = 0;

function DraftForm({
  save,
  enabled = true,
}: {
  save: (draft: { name: string }) => void | boolean | Promise<void | boolean>;
  enabled?: boolean;
}) {
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

/** Exposes the autosave so a test can await a transition flush. */
let exposed: { flush: () => Promise<boolean> } | null = null;
function FlushForm({
  save,
  enabled = true,
}: {
  save: (draft: { name: string }) => Promise<boolean>;
  enabled?: boolean;
}) {
  const form = useAppForm({ schema, defaultValues: { name: 'دکان', note: '' } });
  const autosave = useFormAutosave(form, { select: (v) => ({ name: v.name }), save, enabled });
  useEffect(() => {
    exposed = autosave;
  }, [autosave]);
  return (
    <form.Field name="name">
      {(f) => <input aria-label="name" value={f.value} onChange={(e) => f.onChange(e.target.value)} />}
    </form.Field>
  );
}

const type = (label: string, values: readonly string[]) => {
  for (const value of values) fireEvent.change(screen.getByLabelText(label), { target: { value } });
};

describe('useFormAutosave', () => {
  it('retries unchanged input after a failed persistence acknowledgement', async () => {
    const save = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
    render(<DraftForm save={save} />);
    await act(async () => type('name', ['نام تازه']));
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => window.dispatchEvent(new Event('pagehide')));
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith({ name: 'نام تازه' });
    await act(async () => window.dispatchEvent(new Event('pagehide')));
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('an older failed write cannot invalidate a newer successful snapshot', async () => {
    let failOld!: (ok: boolean) => void;
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<boolean>((resolve) => {
            failOld = resolve;
          }),
      )
      .mockResolvedValue(true);
    render(<DraftForm save={save} />);
    type('name', ['نام اول', 'نام دوم']);
    await act(async () => window.dispatchEvent(new Event('pagehide')));
    await act(async () => failOld(false));
    await act(async () => window.dispatchEvent(new Event('pagehide')));
    expect(save).toHaveBeenCalledTimes(2);
  });
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

  it('flush() resolves whether the current input is persisted, so a transition can wait for it', async () => {
    const save = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValue(true);
    render(<FlushForm save={save} />);
    await expect(exposed!.flush()).resolves.toBe(true); // nothing changed: the mounted draft is already saved
    expect(save).not.toHaveBeenCalled();
    type('name', ['دکان نو']); // leading save (succeeds)
    await expect(exposed!.flush()).resolves.toBe(true);
    type('name', ['دکان نوین']); // leading save of the next burst (fails)
    await expect(exposed!.flush()).resolves.toBe(false);
    // the failed input is written again and now succeeds
    await expect(exposed!.flush()).resolves.toBe(true);
    expect(save).toHaveBeenCalledTimes(3);
    expect(save).toHaveBeenLastCalledWith({ name: 'دکان نوین' });
  });

  it('flush() waits for the write in flight instead of writing the same input twice', async () => {
    let settle!: (ok: boolean) => void;
    const save = vi.fn(() => new Promise<boolean>((resolve) => (settle = resolve)));
    render(<FlushForm save={save} />);
    type('name', ['دکان نو']); // leading save, still in flight
    let outcome: boolean | undefined;
    void exposed!.flush().then((ok) => (outcome = ok));
    await act(async () => undefined);
    expect(outcome).toBeUndefined();
    await act(async () => settle(false));
    expect(outcome).toBe(false);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('a late failure of an older write leaves flush() reporting the newer one', async () => {
    let failOld!: (ok: boolean) => void;
    const save = vi
      .fn()
      .mockImplementationOnce(() => new Promise<boolean>((resolve) => (failOld = resolve)))
      .mockResolvedValue(true);
    render(<FlushForm save={save} />);
    type('name', ['نام اول', 'نام دوم']); // the first is written at once; the second waits for the burst
    await expect(exposed!.flush()).resolves.toBe(true);
    await act(async () => failOld(false));
    await expect(exposed!.flush()).resolves.toBe(true); // the newer write stands: nothing is rewritten
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith({ name: 'نام دوم' });
  });

  it('flush() while disabled writes nothing and reports unsaved input as not persisted', async () => {
    const save = vi.fn().mockResolvedValue(true);
    const view = render(<FlushForm save={save} enabled={false} />);
    await expect(exposed!.flush()).resolves.toBe(true); // nothing to save yet
    type('name', ['قفل']);
    await expect(exposed!.flush()).resolves.toBe(false);
    expect(save).not.toHaveBeenCalled();
    view.rerender(<FlushForm save={save} />);
    await expect(exposed!.flush()).resolves.toBe(true);
    expect(save).toHaveBeenCalledWith({ name: 'قفل' });
  });

  it('schedule() saves state kept outside the form', () => {
    const save = vi.fn();
    render(<RowsForm save={save} />);
    expect(save).not.toHaveBeenCalled(); // mount: the draft already has it
    fireEvent.click(screen.getByRole('button', { name: 'row' }));
    expect(save).toHaveBeenLastCalledWith({ name: 'دکان', rows: 1 });
  });
});
