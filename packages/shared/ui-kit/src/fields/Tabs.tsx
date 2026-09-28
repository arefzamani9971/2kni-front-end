'use client';
import { Tabs as RTabs } from 'radix-ui';
import type { ReactNode } from 'react';

export function Tabs<V extends string>({
  value,
  onChange,
  tabs,
  className,
}: {
  value: V;
  onChange: (v: V) => void;
  tabs: readonly { value: V; label: ReactNode; content: ReactNode }[];
  className?: string;
}) {
  return (
    <RTabs.Root value={value} onValueChange={(v) => onChange(v as V)} dir="rtl" className={className}>
      <RTabs.List className="flex border-b border-line">
        {tabs.map((t) => (
          <RTabs.Trigger
            key={t.value}
            value={t.value}
            className="-mb-px h-11 flex-1 border-b-2 border-transparent text-label-m text-fg-secondary data-[state=active]:border-brand data-[state=active]:text-fg-brand"
          >
            {t.label}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {tabs.map((t) => (
        <RTabs.Content key={t.value} value={t.value} className="pt-4 outline-none">
          {t.content}
        </RTabs.Content>
      ))}
    </RTabs.Root>
  );
}
