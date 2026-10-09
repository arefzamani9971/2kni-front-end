import type { DatePart } from './date-picker.types';
export interface DateWheelProps {
  part: DatePart;
  label: string;
  value: number;
  values: number[];
  format: (value: number) => string;
  onChange: (part: DatePart, value: number) => void;
  invalid?: boolean;
  describedBy?: string;
  onSettlingChange: (part: DatePart, settling: boolean) => void;
}
