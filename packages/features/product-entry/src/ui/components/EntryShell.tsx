'use client';
import { useActiveStore } from '@dukani/platform';
import { Button, PageShell, PageState } from '@dukani/ui-kit';
import type { ReactNode } from 'react';

/** Entry screens of page 17: title + «دکانی · فروشگاه», content, persistent actions, bottom navigation. */
export function EntryShell({ title, actions, children }: { title: ReactNode; actions?: ReactNode; children: ReactNode }) {
  const store = useActiveStore();
  return (
    <PageShell title={title} subtitle={`دکانی · ${store.name}`} actions={actions}>
      {children}
    </PageShell>
  );
}

/** A draft link opened on another device or after the draft was removed. */
export function MissingDraft({ onRestart }: { onRestart: () => void }) {
  return (
    <EntryShell title="پیش‌نویس پیدا نشد">
      <PageState
        kind="not-found"
        title="این پیش‌نویس روی این دستگاه نیست"
        description="پیش‌نویس ثبت کالا فقط روی همین دستگاه ذخیره می‌شود. ثبت را از ابتدا شروع کنید."
        action={<Button onClick={onRestart}>شروع دوباره</Button>}
      />
    </EntryShell>
  );
}

export function BackButton({ onClick, label = 'بازگشت' }: { onClick: () => void; label?: string }) {
  return (
    <Button type="button" variant="secondary" block onClick={onClick}>
      {label}
    </Button>
  );
}
