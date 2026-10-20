'use client';
import type { AppError } from '@dukani/domain';
import { Alert, Button, useAppErrorMessage } from '@dukani/ui-kit';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

/**
 * The state of the last receipt command, never a guess: unknown (sent, no answer) offers only «بررسی دوباره» with
 * the same operation; a definitive refusal says nothing was recorded; a failed local draft write says nothing was
 * sent; a failed refresh after success is not a failure of the receipt.
 */
export function ReceiptOutcome({
  unknown,
  failed,
  draftError,
  followUpFailed,
  busy,
  onRecover,
}: {
  unknown: boolean;
  failed: AppError | null;
  draftError: unknown;
  followUpFailed: boolean;
  busy: boolean;
  onRecover: () => void;
}) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  if (unknown)
    return (
      <Alert
        tone="warning"
        title={t('receipt.unknownTitle')}
        description={t('receipt.unknownHint')}
        action={
          <Button size="sm" variant="secondary" loading={busy} onClick={onRecover}>
            {t('checkAgain')}
          </Button>
        }
      />
    );
  if (draftError) return <Alert tone="danger" title={t('receipt.draftFailed')} />;
  if (failed)
    return (
      <Alert
        tone="danger"
        title={t('receipt.failedTitle')}
        description={`${errorMessage(failed)} ${t('receipt.failedHint')}`}
      />
    );
  if (followUpFailed) return <Alert tone="info" title={t('receipt.followUpFailed')} />;
  return null;
}
