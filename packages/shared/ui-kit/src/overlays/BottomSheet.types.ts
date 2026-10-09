import type { ReactNode } from 'react';

export type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Sticky actions at the bottom of the sheet (above the keyboard and safe area). */
  footer?: ReactNode;
  /** Full-height sheet for long lists and forms. */
  full?: boolean;
  className?: string;
  onCloseAutoFocus?: (event: Event) => void;
  /** Compact picker anatomy: handle, text title, content and actions without section borders. */
  layout?: 'default' | 'compact';
};
