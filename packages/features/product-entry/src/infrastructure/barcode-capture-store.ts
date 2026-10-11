import type { DraftStore } from '@dukani/platform';
import type { BarcodeCapture } from '../domain/barcode-capture.types';
export function createBarcodeCaptureStore(drafts: DraftStore, userId: () => string) {
  const pending = new Map<string, Promise<unknown>>();
  const key = (storeId: string) => ({ storeId, userId: userId(), flow: 'entry-barcode', id: 'capture' });
  return {
    async read(storeId: string): Promise<BarcodeCapture | null> {
      const value = (await drafts.get<BarcodeCapture>(key(storeId)))?.data ?? null;
      if (value && value.schemaVersion !== 1) throw new Error('DRAFT_SCHEMA_UNSUPPORTED');
      return value;
    },
    write(storeId: string, value: BarcodeCapture): Promise<void> {
      const scopedKey = key(storeId);
      const id = scopedKey.userId + ':' + storeId;
      const task = (pending.get(id) ?? Promise.resolve()).then(async () => {
        await drafts.put(scopedKey, value);
      });
      pending.set(
        id,
        task.catch(() => undefined),
      );
      return task;
    },
  };
}
