'use client';

import { Button } from '../primitives/Button';
import { Overlay } from './Overlay';
import type { ConfirmDialogProps } from './ConfirmDialog.types';

/**
 * Figma `Dukani/Confirmation Overlay` (633:347): mobile bottom sheet / desktop dialog via `Overlay`.
 * Destructive actions need a label and confirmation, not an icon alone (ui-guidelines §15), and stay Danger on
 * both viewports (the Figma desktop sample uses the brand color; semantics win — flagged to design).
 */
export function ConfirmDialog({
  confirmLabel,
  cancelLabel = 'انصراف',
  destructive,
  loading,
  onConfirm,
  ...props
}: ConfirmDialogProps) {
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
