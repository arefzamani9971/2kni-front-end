'use client';
import { Dialog as RDialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { Button } from '../primitives/Button';
import { cn } from '../lib/cn';

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function Dialog({ open, onOpenChange, title, description, children, actions, className }: DialogProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-40 animate-fade-in bg-scrim" />
        <RDialog.Content
          dir="rtl"
          className={cn(
            'fixed inset-x-4 top-1/2 z-50 mx-auto flex max-w-[400px] -translate-y-1/2 flex-col gap-4 rounded-lg bg-surface p-5 shadow-strong outline-none',
            className,
          )}
        >
          <RDialog.Title className="text-heading-m text-fg-primary">{title}</RDialog.Title>
          {description ? (
            <RDialog.Description className="text-body-m text-fg-secondary">{description}</RDialog.Description>
          ) : (
            <RDialog.Description className="sr-only">{typeof title === 'string' ? title : ''}</RDialog.Description>
          )}
          {children}
          {actions ? <div className="flex flex-col gap-2">{actions}</div> : null}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

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
