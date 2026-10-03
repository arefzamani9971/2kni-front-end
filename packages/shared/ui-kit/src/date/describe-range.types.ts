import type { DateRange, PeriodPreset } from '@dukani/domain';

export type DateRangeValue = { preset: PeriodPreset | 'Custom'; range: DateRange };
