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
  /** Primary first. A row of equal-width buttons (Figma «Dialog actions»); stacked on narrow screens. */
  actions?: ReactNode;
  /** `wide` for long forms and lists (the body scrolls); default is Figma `Desktop Dialog` 560. */
  size?: 'default' | 'wide';
  className?: string;
};

/**
 * Figma `Dukani/Desktop Dialog` (498:574) and the Desktop variants of `Confirmation Overlay` / `Form Overlay`
 * (633:347, 633:494): 560px, radius lg, padding spacing/6, gap spacing/4, title Heading/L, text Body/M secondary,
 * Shadow/Strong. Focus is trapped and returns to the trigger (Radix). Features normally use `Overlay`, which picks
 * this on desktop and a bottom sheet on mobile.
 */
export function Dialog({ open, onOpenChange, title, description, children, actions, size = 'default', className }: DialogProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-40 animate-fade-in bg-scrim" />
        <RDialog.Content
          dir="rtl"
          className={cn(
            'fixed inset-x-4 top-1/2 z-50 mx-auto flex max-h-[calc(100dvh-4rem)] -translate-y-1/2 flex-col gap-4 rounded-lg bg-surface p-6 shadow-strong outline-none',
            size === 'wide' ? 'max-w-[720px]' : 'max-w-[560px]',
            className,
          )}
        >
          <div className="flex shrink-0 flex-col gap-2">
            <RDialog.Title className="text-heading-l text-fg-primary">{title}</RDialog.Title>
            {description ? (
              <RDialog.Description className="text-body-m text-fg-secondary">{description}</RDialog.Description>
            ) : (
              <RDialog.Description className="sr-only">{typeof title === 'string' ? title : ''}</RDialog.Description>
            )}
          </div>
          {children ? <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">{children}</div> : null}
          {actions ? <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:*:flex-1">{actions}</div> : null}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
