'use client';
import { Button, PageShell } from '@dukani/ui-kit';

/**
 * leaveform «تغییرات ذخیره نشده‌اند» (Figma 594:6931): decide before leaving a form with unsaved edits.
 * «ذخیره پیش‌نویس» of the frame is not offered: F03 keeps no local draft of a store edit yet (see README).
 */
export function LeaveFormView({ onStay, onDiscard }: { onStay: () => void; onDiscard: () => void }) {
  return (
    <PageShell
      title="تغییرات ذخیره نشده‌اند"
      back={onStay}
      nav={false}
      actions={
        <>
          <Button block onClick={onStay}>
            ادامه ویرایش
          </Button>
          <Button variant="secondary" block onClick={onDiscard}>
            خروج بدون ذخیره
          </Button>
        </>
      }
    >
      <section className="border-line bg-surface flex flex-col gap-3 rounded-md border p-4">
        <h2 className="text-heading-m text-fg-primary">تغییرات ذخیره نشده‌اند</h2>
        <p className="text-body-m text-fg-secondary">پیش از خروج، درباره تغییرات این فروشگاه تصمیم بگیرید.</p>
      </section>
    </PageShell>
  );
}
