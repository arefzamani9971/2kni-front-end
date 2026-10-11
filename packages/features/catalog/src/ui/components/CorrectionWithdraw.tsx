'use client';
import { useState } from 'react';
import { Alert, Button, ConfirmDialog, useAppErrorMessage } from '@dukani/ui-kit';
import { useCorrectionActions } from '../hooks/use-correction-actions';
import { useCatalogTexts } from '../i18n/use-catalog-translations';

/** Withdraws the request after a confirmation; the store product never changes (F11 §7 Withdrawn). */
export function CorrectionWithdraw({ correctionId }: { correctionId: string }) {
  const t = useCatalogTexts();
  const errorMessage = useAppErrorMessage();
  const actions = useCorrectionActions(correctionId);
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      {actions.error ? (
        <Alert
          tone="danger"
          title={t('correctionStatus.actionFailed')}
          description={errorMessage(actions.error)}
        />
      ) : null}
      <Button variant="secondary" block onClick={() => setConfirming(true)}>
        {t('correctionStatus.withdraw')}
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t('correctionStatus.withdrawTitle')}
        description={t('correctionStatus.withdrawHint')}
        confirmLabel={t('correctionStatus.withdraw')}
        cancelLabel={t('correctionStatus.cancel')}
        destructive
        loading={actions.pending}
        onConfirm={() => void actions.run({ kind: 'withdraw' }).then(() => setConfirming(false))}
      />
    </>
  );
}
