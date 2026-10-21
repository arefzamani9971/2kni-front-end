'use client';
import { useQueryCache } from '@dukani/data';
import { isAppError } from '@dukani/domain';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import type { PickedFile } from '@dukani/ui-kit';
import { useRef, useState } from 'react';
import { createAttachmentUploader } from '../../../application/upload-attachments';
import { usePurchasingModule } from '../../../module';
import { purchaseKeys } from '../../common/state/purchase-keys';
import { usePurchase } from './use-purchase';
import type {
  AttachmentError,
  AttachmentUploadSession,
  UploadState,
} from '../types/use-purchase-attachments.types';
export function usePurchaseAttachments(purchaseId: string) {
  const store = useActiveStore();
  const nav = useNavigation();
  const cache = useQueryCache();
  const { files, purchases } = usePurchasingModule();
  const purchase = usePurchase(purchaseId);
  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [state, setState] = useState<UploadState>({});
  const [error, setError] = useState<AttachmentError | null>(null);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const session = useRef<AttachmentUploadSession | null>(null);
  const save = async () => {
    const receipt = purchase.data;
    if (!receipt || pending.current || !picked.length) return;
    const key = `${store.id}:${purchaseId}`;
    if (session.current?.key !== key) {
      session.current = {
        key,
        upload: createAttachmentUploader({ uploader: files, storeId: store.id, purchaseId }),
      };
    }
    const upload = session.current.upload;
    pending.current = true;
    setSaving(true);
    setError(null);
    let stage: 'uploadFailed' | 'attachmentFailed' = 'uploadFailed';
    try {
      const ids = await upload(picked, (id, value) => setState((s) => ({ ...s, [id]: value })));
      stage = 'attachmentFailed';
      const dto = await purchases.setAttachments(store.id, receipt.id, [
        ...new Set([...receipt.attachmentFileIds, ...ids]),
      ]);
      cache.set(purchaseKeys(store.id).detail(receipt.id), dto);
      nav.replace(
        receipt.status === 'Draft'
          ? sellerRoutes.purchases.totals(store.id, receipt.id)
          : sellerRoutes.purchases.detail(store.id, receipt.id),
      );
    } catch (cause) {
      setError(isAppError(cause) ? cause : stage);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  return { purchase, picked, setPicked, state, error, saving, save, back: () => nav.back() };
}
