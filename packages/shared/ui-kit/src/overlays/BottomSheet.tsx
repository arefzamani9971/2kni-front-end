'use client';
// Adapter over vaul (drawer). On compact screens large modals become full-height sheets (ui-guidelines §12).
import type { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { cn } from '../lib/cn';
import { IconButton } from '../primitives/IconButton';

export type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Sticky actions at the bottom of the sheet (above the keyboard and safe area). */
  footer?: ReactNode;
  /** Full-height sheet for long lists and forms. */
  full?: boolean;
  className?: string;
};

export function BottomSheet({ open, onOpenChange, title, description, children, footer, full, className }: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-scrim" />
        <Drawer.Content
          dir="rtl"
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[480px] flex-col rounded-t-lg bg-surface outline-none',
            full ? 'h-[92dvh]' : 'max-h-[85dvh]',
            className,
          )}
        >
          <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong" />
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-4">
            <Drawer.Title className="flex-1 text-heading-m text-fg-primary">{title}</Drawer.Title>
            <IconButton icon="close" label="بستن" onClick={() => onOpenChange(false)} className="-me-2" />
          </div>
          {description ? (
            <Drawer.Description className="px-4 pt-3 text-body-m text-fg-secondary">{description}</Drawer.Description>
          ) : (
            <Drawer.Description className="sr-only">{typeof title === 'string' ? title : ''}</Drawer.Description>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
          {footer ? <div className="pb-safe flex shrink-0 flex-col gap-2 border-t border-line bg-surface px-4 pt-4">{footer}</div> : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
