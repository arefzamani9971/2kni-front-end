'use client';
import { useActiveStore } from '@dukani/platform';
import { Alert, Button, Overlay, TextArea } from '@dukani/ui-kit';
import { useState } from 'react';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';

/**
 * PURCHASE_DUPLICATE_INVOICE (BIZ-PUR-03): the same supplier already has this invoice number. Only the owner may
 * record it again, with a written reason; anyone else can change the number or go back. Never a silent continue.
 */
export function DuplicateInvoiceDialog({
  open,
  message,
  busy,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  message: string;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const t = usePurchaseTranslations();
  const owner = useActiveStore().role === 'Owner';
  const [reason, setReason] = useState('');
  return (
    <Overlay
      open={open}
      onOpenChange={onOpenChange}
      title={t('receipt.duplicateTitle')}
      description={message}
      actions={
        <>
          {owner ? (
            <Button loading={busy} disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())}>
              {t('receipt.duplicateConfirm')}
            </Button>
          ) : null}
          <Button variant="secondary" disabled={busy} onClick={() => onOpenChange(false)}>
            {t('back')}
          </Button>
        </>
      }
    >
      {owner ? (
        <TextArea
          label={t('receipt.duplicateReason')}
          required
          value={reason}
          onChange={setReason}
          maxLength={500}
          placeholder={t('receipt.duplicateReasonHint')}
        />
      ) : (
        <Alert tone="warning" title={t('receipt.duplicateOwnerOnly')} />
      )}
    </Overlay>
  );
}
