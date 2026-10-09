import type { DateOnly } from '@dukani/domain';
import type { PickerPanelProps } from '../overlays/PickerPanel.types';
import type { DatePart } from './date-picker.types';

export type DatePickerPanelProps = Pick<
  PickerPanelProps,
  'open' | 'onOpenChange' | 'anchorRef' | 'triggerRef'
> & {
  draft: DateOnly | '';
  cursorDate: DateOnly;
  announcement: string;
  onPartChange: (part: DatePart, value: number) => void;
  onSettlingChange: (part: DatePart, settling: boolean) => void;
  typed: string;
  typedError: string | null;
  onTypedChange: (value: string) => void;
  onChoose: (value: DateOnly | '') => void;
  onConfirm: () => void;
  onCancel: () => void;
  canConfirm: boolean;
  canClear: boolean;
  min?: DateOnly;
  max?: DateOnly;
  isDisabled: (value: DateOnly) => boolean;
};
