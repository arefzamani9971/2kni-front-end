'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { Button } from '../primitives/Button';
import type { FormActionsProps } from './FormActions.types';
import { StickyActionBar } from './StickyActionBar';

/**
 * The action row of every form (PAT-FORM-01): Primary submit first, then «انصراف». Mobile stacks full-width
 * buttons (sticky above the safe area when `sticky`); desktop puts them in one row at the start edge, sized to their
 * labels — the same order and CSS as `StickyActionBar`. Pass `busy={form.formState.isSubmitting}`.
 */
export function FormActions({
  submitLabel,
  busy,
  onCancel,
  cancelLabel,
  sticky = false,
  disabled,
  hint,
  extra,
  formId,
}: FormActionsProps) {
  const t = useUiTranslations();
  const buttons = (
    <>
      <Button type="submit" form={formId} loading={busy} disabled={disabled}>
        {submitLabel}
      </Button>
      {onCancel ? (
        <Button variant="secondary" disabled={busy} onClick={onCancel}>
          {cancelLabel ?? t('formActions.cancel')}
        </Button>
      ) : null}
      {extra}
    </>
  );
  return (
    <div className="flex flex-col gap-2">
      {hint ? <p className="text-body-s text-fg-secondary">{hint}</p> : null}
      {sticky ? (
        <StickyActionBar>{buttons}</StickyActionBar>
      ) : (
        <div
          className={cn(
            'flex flex-col gap-2',
            'desktop:flex-row-reverse desktop:justify-end desktop:gap-3 desktop:*:w-auto',
          )}
        >
          {buttons}
        </div>
      )}
    </div>
  );
}
