'use client';
// Adapter over vaul (drawer). On compact screens large modals become full-height sheets (ui-guidelines §12).
// Features normally use `Overlay` (mobile → this sheet, desktop → Dialog); use BottomSheet directly only for
// content that is mobile-only by design (e.g. the scan result tray).

import { Drawer } from 'vaul';
import { cn } from '../lib/cn';
import { IconButton } from '../primitives/IconButton';
import type { BottomSheetProps } from './BottomSheet.types';

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  full,
  className,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="bg-scrim fixed inset-0 z-40" />
        <Drawer.Content
          dir="rtl"
          className={cn(
            'bg-surface fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[480px] flex-col rounded-t-lg outline-none',
            full ? 'h-[92dvh]' : 'max-h-[85dvh]',
            className,
          )}
        >
          <div aria-hidden className="bg-line-strong mx-auto mt-2 h-1 w-10 shrink-0 rounded-full" />
          <div className="border-line flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <Drawer.Title className="text-heading-m text-fg-primary flex-1">{title}</Drawer.Title>
            <IconButton icon="close" label="بستن" onClick={() => onOpenChange(false)} className="-me-2" />
          </div>
          {description ? (
            <Drawer.Description className="text-body-m text-fg-secondary px-4 pt-3">
              {description}
            </Drawer.Description>
          ) : (
            <Drawer.Description className="sr-only">
              {typeof title === 'string' ? title : ''}
            </Drawer.Description>
          )}
          {children ? <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div> : null}
          {footer ? (
            <div className="pb-safe border-line bg-surface flex shrink-0 flex-col gap-2 border-t px-4 pt-4">
              {footer}
            </div>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
