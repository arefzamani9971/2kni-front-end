'use client';
import { PERIOD_LABELS, formatJalali, resolvePeriod, type DateOnly, type DateRange, type PeriodPreset } from '@dukani/domain';
import { useId, useState, type ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { BottomSheet } from '../overlays/BottomSheet';
import { Button } from '../primitives/Button';
import { Chip, ChipGroup } from '../primitives/Chip';
import { FieldShell } from '../fields/FieldShell';
import { JalaliCalendar } from './JalaliCalendar';

export type DateRangeValue = { preset: PeriodPreset | 'Custom'; range: DateRange };

const DEFAULT_PRESETS: readonly PeriodPreset[] = ['Today', 'ThisWeek', 'ThisMonth', 'Last7Days', 'Last30Days', 'Last90Days'];

export const describeRange = (v: DateRangeValue): string =>
  v.preset !== 'Custom'
    ? PERIOD_LABELS[v.preset]
    : v.range.from === v.range.to
      ? formatJalali(v.range.from)
      : `${formatJalali(v.range.from)} تا ${formatJalali(v.range.to)}`;

/** Period filter for reports and lists: presets (week starts Saturday, Jalali month) + custom range. */
export function DateRangeField({
  label = 'بازه',
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  max,
  className,
}: {
  label?: ReactNode;
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  presets?: readonly PeriodPreset[];
  max?: DateOnly;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ from: DateOnly | null; to: DateOnly | null }>(value.range);
  return (
    <>
      <FieldShell id={id} label={label} className={className} suffix={<Icon name="calendar" size={20} className="text-icon" />} classNames={{ box: 'cursor-pointer' }}>
        <button id={id} type="button" aria-haspopup="dialog" onClick={() => { setDraft(value.range); setOpen(true); }} className="tabular h-full flex-1 text-start text-body-m">
          {describeRange(value)}
        </button>
      </FieldShell>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        full
        footer={
          <Button
            block
            disabled={!draft.from}
            onClick={() => {
              onChange({ preset: 'Custom', range: { from: draft.from!, to: draft.to ?? draft.from! } });
              setOpen(false);
            }}
          >
            اعمال بازه
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <ChipGroup label="بازه‌های آماده">
            {presets.map((p) => (
              <Chip
                key={p}
                selected={value.preset === p}
                onClick={() => {
                  onChange({ preset: p, range: resolvePeriod(p) });
                  setOpen(false);
                }}
              >
                {PERIOD_LABELS[p]}
              </Chip>
            ))}
          </ChipGroup>
          <p className={cn('text-body-s text-fg-secondary')}>
            {draft.from ? `از ${formatJalali(draft.from)}${draft.to ? ` تا ${formatJalali(draft.to)}` : ' — روز پایان را انتخاب کنید'}` : 'روز شروع را انتخاب کنید'}
          </p>
          <JalaliCalendar mode="range" value={draft} onChange={setDraft} max={max} />
        </div>
      </BottomSheet>
    </>
  );
}

/** Horizontal preset chips that change every card of a report at once (F24); «بازه دلخواه» opens the sheet. */
export function PeriodSwitcher({
  value,
  onChange,
  presets = ['Today', 'ThisWeek', 'ThisMonth', 'Last30Days'],
}: {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  presets?: readonly PeriodPreset[];
}) {
  const [custom, setCustom] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {presets.map((p) => (
          <Chip key={p} selected={value.preset === p} onClick={() => onChange({ preset: p, range: resolvePeriod(p) })}>
            {PERIOD_LABELS[p]}
          </Chip>
        ))}
        <Chip selected={value.preset === 'Custom'} onClick={() => setCustom(true)}>
          {value.preset === 'Custom' ? describeRange(value) : 'بازه دلخواه'}
        </Chip>
      </div>
      {custom ? (
        <DateRangeField
          label="بازه دلخواه"
          value={value}
          onChange={(v) => {
            onChange(v);
            setCustom(false);
          }}
        />
      ) : null}
    </div>
  );
}
