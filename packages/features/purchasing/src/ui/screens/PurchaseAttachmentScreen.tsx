'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import { type AppError, isAppError } from '@dukani/domain';
import { useQueryCache } from '@dukani/data';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, FileUploadField, ListRow, PageState, Section, type PickedFile } from '@dukani/ui-kit';
import { useState } from 'react';
import { usePurchasingModule } from '../../module';
import { PurchasingShell } from '../components/PurchasingShell';
import { purchaseKeys } from '../hooks/purchase-keys';
import { usePurchase } from '../hooks/use-purchase';
import type { UploadState } from './PurchaseAttachmentScreen.types';

/** purchaseattachment (Figma 358:548): photo or PDF of the supplier invoice (upload via FileUploader port, BCR-13). */
export function PurchaseAttachmentScreen({ purchaseId }: { purchaseId: string }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();

  const store = useActiveStore();
  const nav = useNavigation();
  const cache = useQueryCache();
  const { files, purchases } = usePurchasingModule();
  const purchase = usePurchase(purchaseId);
  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [state, setState] = useState<UploadState>({});
  const [error, setError] = useState<AppError | 'uploadFailed' | 'attachmentFailed' | null>(null);
  const [saving, setSaving] = useState(false);
  const p = purchase.data;

  const save = async () => {
    if (!p) return;
    setSaving(true);
    setError(null);
    const ids: string[] = [];
    for (const f of picked) {
      setState((s) => ({ ...s, [f.id]: 'uploading' }));
      try {
        ids.push((await files.upload(store.id, f.file, 'PurchaseAttachment')).fileId);
        setState((s) => ({ ...s, [f.id]: 'done' }));
      } catch (e) {
        setState((s) => ({ ...s, [f.id]: 'failed' }));
        setError(isAppError(e) ? e : 'uploadFailed');
        setSaving(false);
        return;
      }
    }
    try {
      const dto = await purchases.setAttachments(store.id, p.id, [...p.attachmentFileIds, ...ids]);
      cache.set(purchaseKeys(store.id).detail(p.id), dto);
      nav.replace(
        p.status === 'Draft'
          ? sellerRoutes.purchases.totals(store.id, p.id)
          : sellerRoutes.purchases.detail(store.id, p.id),
      );
    } catch (e) {
      setError(isAppError(e) ? e : 'attachmentFailed');
      setSaving(false);
    }
  };

  return (
    <PurchasingShell
      title={t('attachmentTitle')}
      back={() => nav.back()}
      actions={
        <Button block loading={saving} disabled={picked.length === 0} onClick={save}>
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
      <FileUploadField
        label={t('file')}
        value={picked}
        onChange={setPicked}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        maxFiles={Math.max(1, 5 - (p?.attachmentFileIds.length ?? 0))}
        maxSizeMb={10}
        hint={t('attachmentHint')}
        fileState={(id) => (state[id] ? { state: state[id]!, onRetry: save } : undefined)}
      />
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
