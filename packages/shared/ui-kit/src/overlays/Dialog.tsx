'use client';
import { Dialog as RDialog } from 'radix-ui';
import type { ReactNode } from 'react';
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
