import type { ReactNode } from 'react';

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Primary first. A row of equal-width buttons (Figma «Dialog actions»); stacked on narrow screens. */
  actions?: ReactNode;
  /** `wide` for long forms and lists (the body scrolls); default is Figma `Desktop Dialog` 560. */
  size?: 'default' | 'wide';
  className?: string;
};
