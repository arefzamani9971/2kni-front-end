'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { useLocale } from '@dukani/i18n';
import { useCallback, useState } from 'react';
import { normalizeDigits, parseJalaliInput, toDateOnly, type DateOnly } from '@dukani/domain';
import type { DateFieldProps } from './DateField.types';
import type { DatePart } from './date-picker.types';
import { changeDatePart, createDatePickerDraft } from './date-picker';

/** Owns the editing session above both presentation strategies. No committed value is duplicated. */
export function useDatePicker(props: DateFieldProps) {
  const t = useUiTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(() => createDatePickerDraft(props.value || toDateOnly(new Date())));
  const [settling, setSettling] = useState<DatePart[]>([]);
  // Disabling the field ends its session; re-enabling must not reopen an old draft.
  if (props.disabled && open) setOpen(false);
  const canClear = !props.required && (props.clearable ?? true);
  const isDisabled = (date: DateOnly) =>
    !!((props.min && date < props.min) || (props.max && date > props.max) || props.isDisabled?.(date));
  // Constraints are derived from current props; changing min/max never leaves a stale validation error.
  const typedError =
    (state.inputError ? t(`date.${state.inputError}`) : null) ??
    (state.draft
      ? isDisabled(state.draft)
        ? t('date.unavailable')
        : null
      : canClear
        ? null
        : t('date.empty'));
  const canConfirm = !props.disabled && !typedError && settling.length === 0;
  const onChoose = useCallback((date: DateOnly | '') => {
    setState((current) =>
      date
        ? createDatePickerDraft(date)
        : { ...current, draft: '', typed: '', inputError: null, correctedDay: null },
    );
  }, []);
  const onPartChange = useCallback((part: DatePart, value: number) => {
    setState((current) => changeDatePart(current, part, value));
  }, []);
  const onSettlingChange = useCallback((part: DatePart, active: boolean) => {
    setSettling((current) =>
      active
        ? current.includes(part)
          ? current
          : [...current, part]
        : current.includes(part)
          ? current.filter((item) => item !== part)
          : current,
    );
  }, []);
  const onTypedChange = (typed: string) => {
    if (!typed) return onChoose('');
    const parsed = parseJalaliInput(typed);
    setState((current) =>
      parsed.ok
        ? { ...createDatePickerDraft(parsed.value), typed }
        : { ...current, typed, inputError: parsed.error },
    );
  };
  const onCancel = () => {
    setOpen(false);
    props.onBlur?.();
  };
  const onOpenChange = (next: boolean) => {
    if (!next) return onCancel();
    const today = toDateOnly(new Date());
    const seed =
      props.value ||
      (props.min && today < props.min ? props.min : props.max && today > props.max ? props.max : today);
    setState(createDatePickerDraft(seed));
    setSettling([]);
    setOpen(true);
  };
  return {
    ...state,
    typed: locale === 'en' ? normalizeDigits(state.typed) : state.typed,
    announcement: state.correctedDay === null ? '' : t('date.dayAdjusted', { day: state.correctedDay }),
    open: open && !props.disabled,
    typedError,
    canConfirm,
    canClear,
    isDisabled,
    onChoose,
    onPartChange,
    onSettlingChange,
    onTypedChange,
    onOpenChange,
    onCancel,
    onConfirm: () => {
      if (!canConfirm) return;
      props.onChange?.(state.draft);
      onCancel();
    },
  };
}
