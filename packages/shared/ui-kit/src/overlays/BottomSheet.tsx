'use client';
import { useLocale, getDirection } from '@dukani/i18n';
import { useUiTranslations } from '../i18n/use-ui-translations';
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
  onCloseAutoFocus,
  layout = 'default',
}: BottomSheetProps) {
  const direction = getDirection(useLocale());
  const t = useUiTranslations();
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false} autoFocus>
      <Drawer.Portal>
        <Drawer.Overlay className="bg-scrim fixed inset-0 z-40" />
        <Drawer.Content
          onCloseAutoFocus={onCloseAutoFocus}
          dir={direction}
          className={cn(
            'bg-surface fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[480px] flex-col rounded-t-lg outline-none',
            full ? 'h-[92dvh]' : 'max-h-[85dvh]',
            layout === 'compact' && 'gap-3 rounded-t-md p-4',
            className,
          )}
        >
          <div
            aria-hidden
            className={cn(
              'bg-line-strong mx-auto h-1 w-10 shrink-0 rounded-full',
              layout === 'default' && 'mt-2',
            )}
          />
          <div
            className={cn(
              'flex shrink-0 items-center gap-2',
              layout === 'default' && 'border-line h-14 border-b px-4',
            )}
          >
            <Drawer.Title
              className={cn(
                'text-fg-primary flex-1',
                layout === 'compact' ? 'text-body-m leading-[23px]' : 'text-heading-m',
              )}
            >
              {title}
            </Drawer.Title>
            {layout === 'default' ? (
              <IconButton
                icon="close"
                label={t('common.close')}
                onClick={() => onOpenChange(false)}
                className="-me-2"
              />
            ) : null}
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
          {children ? (
            <div className={cn('min-h-0 flex-1 overflow-y-auto', layout === 'default' && 'p-4')}>
              {children}
            </div>
          ) : null}
          {footer ? (
            <div
              className={cn(
                'bg-surface flex shrink-0 flex-col gap-2',
                layout === 'default'
                  ? 'pb-safe border-line border-t px-4 pt-4'
                  : 'pb-[env(safe-area-inset-bottom)]',
              )}
            >
              {footer}
            </div>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
