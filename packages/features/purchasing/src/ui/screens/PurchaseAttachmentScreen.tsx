'use client';
import {
  useAppErrorMessage,
  Alert,
  Button,
  FileUploadField,
  ListRow,
  PageState,
  Section,
} from '@dukani/ui-kit';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import { usePurchaseAttachments } from '../hooks/use-purchase-attachments';
import { PurchasingShell } from '../components/PurchasingShell';
/** Receipt attachments; upload and retry behavior belongs to the feature hook. */
export function PurchaseAttachmentScreen({ purchaseId }: { purchaseId: string }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const { purchase, picked, setPicked, state, error, saving, save, back } =
    usePurchaseAttachments(purchaseId);
  const p = purchase.data;

  return (
    <PurchasingShell
      title={t('attachmentTitle')}
      back={back}
      actions={
        <Button block loading={saving} disabled={!p || picked.length === 0} onClick={save}>
          {t('saveAttachment')}
        </Button>
      }
    >
      {!p ? <PageState kind="loading" rows={2} /> : null}
      {error ? (
        <Alert
          title={t('saveFailed')}
          description={typeof error === 'string' ? t(error) : errorMessage(error)}
        />
      ) : null}
      <fieldset disabled={saving} aria-busy={saving}>
        <FileUploadField
          label={t('file')}
          value={picked}
          onChange={setPicked}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          maxFiles={Math.max(0, 5 - (p?.attachmentFileIds.length ?? 0))}
          maxSizeMb={10}
          hint={t('attachmentHint')}
          fileState={(id) => (state[id] ? { state: state[id]!, onRetry: save } : undefined)}
        />
      </fieldset>
      {p && p.attachmentFileIds.length > 0 ? (
        <Section title={t('currentAttachments')}>
          <ListRow>
            {p.attachmentFileIds.length} {t('fileAttached')}
          </ListRow>
        </Section>
      ) : null}
    </PurchasingShell>
  );
}
