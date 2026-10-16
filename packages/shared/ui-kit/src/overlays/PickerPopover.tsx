'use client';
import { useLocale, getDirection } from '@dukani/i18n';
import { Popover } from 'radix-ui';
import { useRef, type RefObject } from 'react';
import { cn } from '../lib/cn';
import type { PickerPanelProps } from './PickerPanel.types';

export function PickerPopover({
  open,
  onOpenChange,
  title,
  anchorRef,
  triggerRef,
  children,
  footer,
  sizing = 'field',
}: PickerPanelProps) {
  const direction = getDirection(useLocale());
  const interactedOutside = useRef(false);
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Anchor virtualRef={anchorRef as RefObject<HTMLElement>} />
      <Popover.Portal>
        <Popover.Content
          dir={direction}
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={16}
          aria-label={typeof title === 'string' ? title : undefined}
          onOpenAutoFocus={() => {
            interactedOutside.current = false;
          }}
          onInteractOutside={() => {
            interactedOutside.current = true;
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            // Preserve the destination of an outside click/Tab, especially another picker.
            if (!interactedOutside.current) triggerRef.current?.focus();
          }}
          className={cn(
            'z-50 flex',
            sizing === 'content'
              ? 'max-h-[var(--radix-popover-content-available-height)] w-[352px] max-w-[calc(100vw-32px)]'
              : 'max-h-[min(360px,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] min-w-60',
            'animate-fade-in border-line bg-surface shadow-medium flex-col overflow-hidden rounded-sm border outline-none',
          )}
        >
          <div className={cn('min-h-0 flex-1 overflow-y-auto', sizing === 'content' ? 'p-4' : 'p-1')}>
            {children}
          </div>
          {footer ? (
            <div className={cn('border-line shrink-0 border-t', sizing === 'content' ? 'p-4' : 'p-1')}>
              {footer}
            </div>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
