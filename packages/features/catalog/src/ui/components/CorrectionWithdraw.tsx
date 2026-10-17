'use client';
import { Alert, Button, ConfirmDialog, useAppErrorMessage, useConfirmAction } from '@dukani/ui-kit';
import { useCorrectionActions } from '../hooks/use-correction-actions';
import { useCatalogTexts } from '../i18n/use-catalog-translations';

/**
 * Withdraws the request after a confirmation; the store product never changes (F11 §7 Withdrawn). The confirmation
 * runs once, stays open while the command runs and keeps a failure inside the dialog.
 */
export function CorrectionWithdraw({ correctionId }: { correctionId: string }) {
  const t = useCatalogTexts();
  const errorMessage = useAppErrorMessage();
  const actions = useCorrectionActions(correctionId);
  const withdraw = useConfirmAction(() => actions.run({ kind: 'withdraw' }));
  return (
    <>
      <Button variant="secondary" block onClick={() => withdraw.open()}>
        {t('correctionStatus.withdraw')}
      </Button>
      <ConfirmDialog
        {...withdraw.dialog}
        title={t('correctionStatus.withdrawTitle')}
        description={t('correctionStatus.withdrawHint')}
        confirmLabel={t('correctionStatus.withdraw')}
        cancelLabel={t('correctionStatus.cancel')}
        destructive
      >
        {withdraw.error ? (
          <Alert
            tone="danger"
            title={t('correctionStatus.actionFailed')}
            description={errorMessage(withdraw.error)}
          />
        ) : null}
      </ConfirmDialog>
    </>
  );
}
