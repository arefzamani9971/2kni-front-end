'use client';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { BottomSheet } from './BottomSheet';

export type QuickAction = { id: string; label: ReactNode; description?: ReactNode; icon?: IconName; onSelect: () => void; disabled?: boolean };

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
              className="flex min-h-14 w-full items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 text-start hover:bg-brand-subtle disabled:opacity-38"
            >
              {a.icon ? (
                <span className="flex size-10 items-center justify-center rounded-md bg-brand-subtle text-fg-brand">
                  <Icon name={a.icon} size={22} />
                </span>
              ) : null}
              <span className="flex flex-1 flex-col">
                <span className="text-label-m text-fg-primary">{a.label}</span>
                {a.description ? <span className="text-body-s text-fg-secondary">{a.description}</span> : null}
              </span>
              <Icon name="chevron-end" size={20} className="text-icon" />
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
