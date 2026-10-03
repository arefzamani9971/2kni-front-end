import type { ReactNode } from 'react';

/**
 * One contract for every modal surface (Figma `Confirmation Overlay` 633:347, `Form Overlay` 633:494,
 * `Customer/Seller Bottom Sheet`, `Desktop Dialog`). Features describe *what* is shown; the viewport decides
 * *how*: Mobile → bottom sheet (grabber, stacked full-width actions above the safe area), Desktop → centered
 * dialog (560, actions in one row). Open state belongs to the caller, so a viewport change keeps it.
 */
export type OverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, primary first. Mobile: stacked · Desktop: one row of equal-width buttons. */
  actions?: ReactNode;
  /**
   * `full` for long lists and multi-field forms: mobile full-height sheet, desktop wide (720) dialog whose
   * body scrolls. Default fits the content.
   */
  size?: 'auto' | 'full';
  className?: string;
};
