import type { Meta, StoryObj } from '@storybook/react-vite';
import { resolvePeriod, type DateOnly } from '@dukani/domain';
import { useState } from 'react';
import { DateField } from '../date/DateField';
import { DateRangeField } from '../date/DateRangeField';
import type { DateRangeValue } from '../date/describe-range';
import { PeriodSwitcher } from '../date/PeriodSwitcher';
import { JalaliCalendar } from '../date/JalaliCalendar';

const meta: Meta = { title: 'Date/Jalali date picker' };
export default meta;

export const Calendar: StoryObj = {
  render: function Render() {
    const [d, setD] = useState<DateOnly | null>(null);
    return (
      <div className="max-w-sm rounded-md border border-line bg-surface p-4">
        <JalaliCalendar mode="single" value={d} onChange={setD} />
      </div>
    );
  },
};

export const Field: StoryObj = {
  render: function Render() {
    const [d, setD] = useState<DateOnly | ''>('');
    return (
      <div className="flex max-w-sm flex-col gap-4">
        <DateField label="تاریخ انقضا" value={d} onChange={setD} optional clearable />
        <DateField label="تاریخ خرید" value={d} onChange={setD} status="error" message="تاریخ خرید را انتخاب کنید." />
      </div>
    );
  },
};

/** Report and list filters: presets (week from Saturday, Jalali month) + custom range. */
export const RangeFilter: StoryObj = {
  render: function Render() {
    const [v, setV] = useState<DateRangeValue>({ preset: 'ThisWeek', range: resolvePeriod('ThisWeek') });
    return (
      <div className="flex max-w-sm flex-col gap-4">
        <PeriodSwitcher value={v} onChange={setV} />
        <DateRangeField label="بازه گزارش" value={v} onChange={setV} />
        <code dir="ltr" className="text-caption">{JSON.stringify(v)}</code>
      </div>
    );
  },
};
