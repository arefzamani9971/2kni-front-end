'use client';
import type { ReactNode } from 'react';
import { Button } from '../primitives/Button';
import { Overlay } from './Overlay';

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Extra content such as a reason field or an Alert about the consequence. */
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
};

/**
 * Figma `Dukani/Confirmation Overlay` (633:347): mobile bottom sheet / desktop dialog via `Overlay`.
 * Destructive actions need a label and confirmation, not an icon alone (ui-guidelines §15), and stay Danger on
 * both viewports (the Figma desktop sample uses the brand color; semantics win — flagged to design).
 */
export function ConfirmDialog({ confirmLabel, cancelLabel = 'انصراف', destructive, loading, onConfirm, ...props }: ConfirmDialogProps) {
  return (
    <Overlay
      {...props}
      actions={
        <>
          <Button block variant={destructive ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button block variant="secondary" disabled={loading} onClick={() => props.onOpenChange(false)}>
            {cancelLabel}
          </Button>
        </>
      }
    />
  );
}
