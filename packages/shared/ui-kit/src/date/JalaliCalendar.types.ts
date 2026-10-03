import type { DateOnly } from '@dukani/domain';

export type CalendarSelection =
  | { mode: 'single'; value: DateOnly | null; onChange: (d: DateOnly) => void }
  | {
      mode: 'range';
      value: { from: DateOnly | null; to: DateOnly | null };
      onChange: (r: { from: DateOnly; to: DateOnly | null }) => void;
    };

export type JalaliCalendarProps = CalendarSelection & {
  min?: DateOnly;
  max?: DateOnly;
  isDisabled?: (d: DateOnly) => boolean;
  className?: string;
};
