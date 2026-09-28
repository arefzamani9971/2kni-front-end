'use client';
import { Button, PageState } from '@dukani/ui-kit';
import { EntryShell } from './EntryShell';

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
