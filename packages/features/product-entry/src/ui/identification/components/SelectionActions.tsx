'use client';
import { Button } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';

/** «بررسی و ادامه» (or «ادامه به موجودی» in bulk entry) and «بازگشت» of the selection screen. */
export function SelectionActions({
  bulk,
  allowed,
  busy,
  onContinue,
  onBack,
}: {
  bulk: boolean;
  allowed: boolean;
  busy: boolean;
  onContinue: () => void;
  onBack: () => void;
}) {
  const t = useEntryTranslations();
  return (
    <>
      <Button block disabled={!allowed} loading={busy} onClick={onContinue}>
        {t(bulk ? 'continueStock' : 'reviewContinue')}
      </Button>
      <Button variant="secondary" block onClick={onBack}>
        {t('back')}
      </Button>
    </>
  );
}
