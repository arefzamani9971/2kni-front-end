'use client';
import type { ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { BottomSheet } from './BottomSheet';
import type { QuickAction } from './QuickActionSheet.types';

/** Figma `Quick Action Sheet`: list of actions (the + button, «کارهای روزانه»). */
export function QuickActionSheet({
  open,
  onOpenChange,
  title,
  actions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  actions: readonly QuickAction[];
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      <ul className="flex flex-col gap-3">
        {actions.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              disabled={a.disabled}
              onClick={() => {
                onOpenChange(false);
                a.onSelect();
              }}
              className="border-line bg-surface hover:bg-brand-subtle disabled:opacity-disabled flex min-h-14 w-full items-center gap-3 rounded-md border px-4 py-3 text-start"
            >
              {a.icon ? (
                <span className="bg-brand-subtle text-fg-brand flex size-10 items-center justify-center rounded-md">
                  <Icon name={a.icon} size={22} />
                </span>
              ) : null}
              <span className="flex flex-1 flex-col">
                <span className="text-label-m text-fg-primary">{a.label}</span>
                {a.description ? (
                  <span className="text-body-s text-fg-secondary">{a.description}</span>
                ) : null}
              </span>
              <Icon name="chevron-end" size={20} className="text-icon" />
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
