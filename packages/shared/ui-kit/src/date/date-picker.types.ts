import type { DateOnly } from '@dukani/domain';

export type DatePart = 'day' | 'month' | 'year';

export interface DatePickerDraft {
  draft: DateOnly | '';
  /** Last complete date remains the wheel cursor while desktop text is incomplete or empty. */
  cursorDate: DateOnly;
  typed: string;
  inputError: string | null;
  announcement: string;
}
