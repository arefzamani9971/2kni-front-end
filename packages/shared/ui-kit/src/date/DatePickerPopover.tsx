'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { toDateOnly } from '@dukani/domain';
import { PickerPopover } from '../overlays/PickerPopover';
import { TextField } from '../fields/TextField';
import { Button } from '../primitives/Button';
import { JalaliCalendar } from './JalaliCalendar';
import type { DatePickerPanelProps } from './DatePickerPanel.types';
import { JALALI_INPUT_PATTERN } from './date-picker.constants';

/** Figma 633:592: desktop calendar and typed entry. */
export function DatePickerPopover(props: DatePickerPanelProps) {
  const t = useUiTranslations();
  const today = toDateOnly(new Date());
  return (
    <PickerPopover
      open={props.open}
      onOpenChange={props.onOpenChange}
      anchorRef={props.anchorRef}
      triggerRef={props.triggerRef}
      title={t('date.title')}
      sizing="content"
      footer={
        <div className="flex gap-2">
          <Button block disabled={!props.canConfirm} onClick={props.onConfirm}>
            {t('date.confirm')}
          </Button>
          <Button block variant="secondary" onClick={props.onCancel}>
            {t('common.cancel')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-body-m text-fg-primary">{t('date.title')}</p>
        <TextField
          label={t('date.inputLabel')}
          value={props.typed}
          dir="ltr"
          placeholder={t('date.placeholder')}
          filter={{ pattern: JALALI_INPUT_PATTERN, message: t('date.format') }}
          status={props.typedError ? 'error' : 'default'}
          message={props.typedError ?? undefined}
          onChange={props.onTypedChange}
        />
        <div className="border-line flex flex-col gap-3 rounded-md border p-[var(--dukani-calendar-panel-padding)]">
          <JalaliCalendar
            mode="single"
            value={props.draft || null}
            onChange={props.onChoose}
            min={props.min}
            max={props.max}
            isDisabled={props.isDisabled}
          />
          <div className="flex gap-2">
            <Button
              block
              variant="text"
              disabled={props.isDisabled(today)}
              onClick={() => props.onChoose(today)}
            >
              {t('common.today')}
            </Button>
            {props.canClear ? (
              <Button block variant="text" onClick={() => props.onChoose('')}>
                {t('common.clear')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </PickerPopover>
  );
}
