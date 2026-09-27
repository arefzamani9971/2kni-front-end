import { useCallback, useState } from 'react';

/** Supports both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) usage. */
export function useControllableState<T>(opts: { value?: T; defaultValue: T; onChange?: (v: T) => void }) {
  const [inner, setInner] = useState<T>(opts.defaultValue);
  const controlled = opts.value !== undefined;
  const value = controlled ? (opts.value as T) : inner;
  const { onChange } = opts;
  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [value, setValue] as const;
}
