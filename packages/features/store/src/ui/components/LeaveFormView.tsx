'use client';
import { useStoreTranslations } from '../i18n/use-store-translations';

import { Button, PageShell } from '@dukani/ui-kit';

/**
 * leaveform «تغییرات ذخیره نشده‌اند» (Figma 594:6931): decide before leaving a form with unsaved edits.
 * «ذخیره پیش‌نویس» of the frame is not offered: F03 keeps no local draft of a store edit yet (see README).
 */
export function LeaveFormView({ onStay, onDiscard }: { onStay: () => void; onDiscard: () => void }) {
  const t = useStoreTranslations();

  return (
    <PageShell
      title={t('unsaved')}
      back={onStay}
      nav={false}
      actions={
        <>
          <Button block onClick={onStay}>
            {t('continueEditing')}
          </Button>
          <Button variant="secondary" block onClick={onDiscard}>
            {t('discard')}
          </Button>
        </>
      }
    >
      <section className="border-line bg-surface flex flex-col gap-3 rounded-md border p-4">
        <h2 className="text-heading-m text-fg-primary">{t('unsaved')}</h2>
        <p className="text-body-m text-fg-secondary">{t('leaveDescription')}</p>
      </section>
    </PageShell>
  );
}
