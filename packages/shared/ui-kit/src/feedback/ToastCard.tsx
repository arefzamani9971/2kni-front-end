'use client';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { IconButton } from '../primitives/IconButton';
import type { ToastItem } from './Toast.types';
import { STATUS_ICON } from './Toast.constants';

export function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const s = STATUS_ICON[item.status];
  return (
    <div
      className={cn(
        'animate-fade-in bg-surface text-body-m text-fg-primary shadow-medium pointer-events-auto flex w-full max-w-[420px] items-center gap-3 rounded-md py-2 ps-4 pe-2',
        'desktop:w-[420px]',
      )}
    >
      <Icon name={s.icon} size={24} className={cn('shrink-0', s.className)} />
      <p className="min-w-0 flex-1">{item.message}</p>
      <IconButton
        icon="close"
        label="بستن پیام"
        size={20}
        className="desktop:size-10 size-12"
        onClick={() => onDismiss(item.id)}
      />
    </div>
  );
}
