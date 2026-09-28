'use client';
import { PERIOD_LABELS, resolvePeriod, type PeriodPreset } from '@dukani/domain';
import { useState } from 'react';
import { Chip } from '../primitives/Chip';
import { DateRangeField } from './DateRangeField';
import { describeRange, type DateRangeValue } from './describe-range';

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
