import type { DateOnly } from '@dukani/domain';
import type { DatePart } from './date-picker.types';
export interface JalaliDateWheelsProps {
  value: DateOnly;
  onChange: (part: DatePart, value: number) => void;
  min?: DateOnly;
  max?: DateOnly;
  error: string | null;
  announcement: string;
  onSettlingChange: (part: DatePart, settling: boolean) => void;
}
