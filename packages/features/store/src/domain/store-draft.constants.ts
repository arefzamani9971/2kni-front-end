import type { ClosedPreset, DaysPreset, StoreDraft, Weekday } from './store-draft.types';

export const EMPTY_STORE_DRAFT: StoreDraft = {
  name: '',
  storeTypeId: '',
  businessMode: 'Retail',
  contact: null,
  location: null,
  hours: null,
  operationId: null,
  storeId: null,
};

/** The Iranian week starts on Saturday (UI) while the wire enum is Sunday..Saturday (F02 §6). */
export const WEEK: readonly Weekday[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const DAYS_PRESETS: Readonly<Record<DaysPreset, { label: string; days: readonly Weekday[] }>> = {
  'sat-wed': { label: 'شنبه تا چهارشنبه', days: WEEK.slice(0, 5) },
  'sat-thu': { label: 'شنبه تا پنجشنبه', days: WEEK.slice(0, 6) },
  all: { label: 'همهٔ روزهای هفته', days: WEEK },
};

export const CLOSED_PRESETS: Readonly<Record<ClosedPreset, { label: string; days: readonly Weekday[] }>> = {
  none: { label: 'بدون تعطیلی', days: [] },
  fri: { label: 'جمعه', days: ['Friday'] },
  'thu-fri': { label: 'پنجشنبه و جمعه', days: ['Thursday', 'Friday'] },
};

/** Opening/closing time options: every 30 minutes. */
export const TIME_OPTIONS: readonly string[] = Array.from(
  { length: 48 },
  (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
);

/** Figma storehours example: Saturday to Thursday, 09:00–21:00, Friday off. */
export const DEFAULT_HOURS = { days: 'sat-thu', opens: '09:00', closes: '21:00', closed: 'fri' } as const;

export const DRAFT_FLOW = 'store-create';
/** Drafts before the store exists live under this pseudo store id (draft key `userId:pending:flow:id`). */
export const PENDING_STORE = 'pending';
export const DRAFT_ID = 'current';
