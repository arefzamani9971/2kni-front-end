'use client';
import type { ReactNode } from 'react';
import { Button } from '../primitives/Button';
import { Dialog } from './Dialog';

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Extra content such as a reason field. */
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
};

/** Destructive actions need a label and confirmation, not an icon alone (ui-guidelines §15). */
export function ConfirmDialog({ confirmLabel, cancelLabel = 'انصراف', destructive, loading, onConfirm, ...props }: ConfirmDialogProps) {
  return (
    <Dialog
      {...props}
      actions={
        <>
          <Button block variant={destructive ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button block variant="secondary" onClick={() => props.onOpenChange(false)}>
            {cancelLabel}
          </Button>
        </>
      }
    />
  );
}
