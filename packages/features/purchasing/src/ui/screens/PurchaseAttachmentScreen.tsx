'use client';
import { isAppError } from '@dukani/domain';
import { useQueryCache } from '@dukani/data';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, FileUploadField, ListRow, PageState, Section, type PickedFile } from '@dukani/ui-kit';
import { useState } from 'react';
import { usePurchasingModule } from '../../module';
import { PurchasingShell } from '../components/PurchasingShell';
import { purchaseKeys } from '../hooks/purchase-keys';
import { usePurchase } from '../hooks/use-purchase';

type UploadState = Record<string, 'uploading' | 'failed' | 'done'>;

/** purchaseattachment (Figma 358:548): photo or PDF of the supplier invoice (upload via FileUploader port, BCR-13). */
export function PurchaseAttachmentScreen({ purchaseId }: { purchaseId: string }) {
  const store = useActiveStore();
  const nav = useNavigation();
  const cache = useQueryCache();
  const { files, purchases } = usePurchasingModule();
  const purchase = usePurchase(purchaseId);
  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [state, setState] = useState<UploadState>({});
  const [error, setError] = useState<string | null>(null);
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
        setError(isAppError(e) ? e.message : 'بارگذاری انجام نشد.');
        setSaving(false);
        return;
      }
    }
    try {
      const dto = await purchases.setAttachments(store.id, p.id, [...p.attachmentFileIds, ...ids]);
      cache.set(purchaseKeys(store.id).detail(p.id), dto);
      nav.replace(p.status === 'Draft' ? sellerRoutes.purchases.totals(store.id, p.id) : sellerRoutes.purchases.detail(store.id, p.id));
    } catch (e) {
      setError(isAppError(e) ? e.message : 'پیوست ذخیره نشد.');
      setSaving(false);
    }
  };

  return (
    <PurchasingShell
      title="ضمیمه فاکتور خرید"
      back={() => nav.back()}
      actions={
        <Button block loading={saving} disabled={picked.length === 0} onClick={save}>
          ذخیره ضمیمه
        </Button>
      }
    >
      {!p ? <PageState kind="loading" rows={2} /> : null}
      {error ? <Alert title="ذخیره نشد" description={error} /> : null}
      <FileUploadField
        label="فایل"
        value={picked}
        onChange={setPicked}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        maxFiles={Math.max(1, 5 - (p?.attachmentFileIds.length ?? 0))}
        maxSizeMb={10}
        hint="فایل به رسید خرید متصل می‌شود؛ فاکتور فروش مشتری آن را نشان نمی‌دهد."
        fileState={(id) => (state[id] ? { state: state[id]!, onRetry: save } : undefined)}
      />
      {p && p.attachmentFileIds.length > 0 ? (
        <Section title="پیوست‌های فعلی">
          <ListRow>{p.attachmentFileIds.length} فایل پیوست شده است.</ListRow>
        </Section>
      ) : null}
    </PurchasingShell>
  );
}
