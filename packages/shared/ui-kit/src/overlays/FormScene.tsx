'use client';
import { Dialog as RDialog } from 'radix-ui';
import { useLocale, getDirection } from '@dukani/i18n';
import { createAdaptive } from '../responsive/adaptive';
import { AppBar } from '../patterns/AppBar';
import { Dialog } from './Dialog';
import type { OverlayProps } from './Overlay.types';

/** Figma brandselect/brandnew: 594:6632/6653 mobile page; 597:3955/4023 desktop dialog. */
function FormPage({ open, onOpenChange, title, children, actions }: OverlayProps) {
  const direction = getDirection(useLocale());
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="bg-scrim fixed inset-0 z-40" />
        <RDialog.Content dir={direction} className="bg-canvas fixed inset-0 z-50 flex flex-col outline-none">
          <div className="bg-surface shrink-0 p-4">
            <AppBar
              title={
                <RDialog.Title asChild>
                  <span>{title}</span>
                </RDialog.Title>
              }
              back={() => onOpenChange(false)}
            />
          </div>
          <RDialog.Description className="sr-only">{title}</RDialog.Description>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">{children}</div>
          {actions ? (
            <div className="bg-surface pb-safe flex shrink-0 flex-col gap-2 p-4">{actions}</div>
          ) : null}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
function FormDialog({ size, ...props }: OverlayProps) {
  return <Dialog {...props} size={size === 'full' ? 'wide' : 'default'} />;
}
export const FormScene = createAdaptive<OverlayProps>('FormScene', { mobile: FormPage, desktop: FormDialog });
