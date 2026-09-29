'use client';
import { Popover } from 'radix-ui';
import type { ReactNode, RefObject } from 'react';
import { cn } from '../lib/cn';
import { createAdaptive } from '../responsive/adaptive';
import { BottomSheet } from './BottomSheet';

/**
 * The panel a field opens to pick a value (Select, Autocomplete, Date). Figma `Select` (649:666) and
 * `Interaction rules`: «on touch present choices in a modal bottom sheet … on desktop a list attached to the
 * input». Mobile → BottomSheet with an accessible title and close; Desktop → popover anchored to the field box,
 * same width, Shadow/Medium. Focus returns to the trigger on close in both.
 */
export type PickerPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sheet title on mobile; accessible name of the popover on desktop. */
  title: ReactNode;
  /** The field box the desktop popover attaches to. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Receives focus back when the panel closes. */
  triggerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  /** Sticky part under the list (e.g. «ساخت نوع جدید»). */
  footer?: ReactNode;
  /** Long lists: full-height sheet on mobile (desktop keeps the anchored popover with its own scroll). */
  full?: boolean;
};

function PickerSheet({ open, onOpenChange, title, children, footer, full }: PickerPanelProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title} full={full} footer={footer}>
      {children}
    </BottomSheet>
  );
}

function PickerPopover({ open, onOpenChange, title, anchorRef, triggerRef, children, footer }: PickerPanelProps) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Anchor virtualRef={anchorRef as RefObject<HTMLElement>} />
      <Popover.Portal>
        <Popover.Content
          dir="rtl"
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={16}
          aria-label={typeof title === 'string' ? title : undefined}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            triggerRef.current?.focus();
          }}
          className={cn(
            'z-50 flex max-h-[min(360px,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] min-w-60',
            'animate-fade-in flex-col overflow-hidden rounded-sm border border-line bg-surface shadow-medium outline-none',
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-1">{children}</div>
          {footer ? <div className="shrink-0 border-t border-line p-1">{footer}</div> : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export const PickerPanel = createAdaptive<PickerPanelProps>('PickerPanel', { mobile: PickerSheet, desktop: PickerPopover });
