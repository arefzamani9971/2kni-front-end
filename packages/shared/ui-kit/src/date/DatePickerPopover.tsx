'use client';
import { JALALI_INPUT_MESSAGES, toDateOnly } from '@dukani/domain';
import { PickerPopover } from '../overlays/PickerPopover';
import { TextField } from '../fields/TextField';
import { Button } from '../primitives/Button';
import { JalaliCalendar } from './JalaliCalendar';
import type { DatePickerPanelProps } from './DatePickerPanel.types';
import { JALALI_INPUT_PATTERN } from './date-picker.constants';

/** Figma 633:592: desktop calendar and typed entry. */
export function DatePickerPopover(props: DatePickerPanelProps) {
  const today = toDateOnly(new Date());
  return (
    <PickerPopover
      open={props.open}
      onOpenChange={props.onOpenChange}
      anchorRef={props.anchorRef}
      triggerRef={props.triggerRef}
      title="انتخاب تاریخ"
      sizing="content"
      footer={
        <div className="flex gap-2">
          <Button block disabled={!props.canConfirm} onClick={props.onConfirm}>
            تأیید تاریخ
          </Button>
          <Button block variant="secondary" onClick={props.onCancel}>
            لغو
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="تاریخ (سال/ماه/روز)"
          value={props.typed}
          dir="ltr"
          placeholder="۱۴۰۵/۰۷/۰۵"
          filter={{ pattern: JALALI_INPUT_PATTERN, message: JALALI_INPUT_MESSAGES.format }}
          status={props.typedError ? 'error' : 'default'}
          message={props.typedError ?? undefined}
          onChange={props.onTypedChange}
        />
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
            امروز
          </Button>
          {props.canClear ? (
            <Button block variant="text" onClick={() => props.onChoose('')}>
              پاک کردن
            </Button>
          ) : null}
        </div>
      </div>
    </PickerPopover>
  );
}
