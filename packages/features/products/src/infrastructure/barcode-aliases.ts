import type { Api } from '@dukani/http';
import type { DraftStore } from '@dukani/platform';
import { appError } from '@dukani/domain';
import type {
  BarcodeAliases,
  BarcodeAliasDrafts,
  BarcodeAliasIntent,
  BarcodeAliasFormDraft,
} from '../application/barcode-alias.types';

export const createBarcodeAliases = (api: Api): BarcodeAliases => ({
  preview: (storeId, productId, body) =>
    api.post('/api/v1/stores/{storeId}/products/{productId}/barcode-aliases/preview', {
      path: { storeId, productId },
      body,
    }),
  commit: (storeId, productId, body, operationId) =>
    api.post('/api/v1/stores/{storeId}/products/{productId}/barcode-aliases', {
      path: { storeId, productId },
      body,
      operationId,
    }),
});
export const createBarcodeAliasDrafts = (drafts: DraftStore, userId: () => string): BarcodeAliasDrafts => {
  const key = (storeId: string, productId: string) => ({
    storeId,
    userId: userId(),
    flow: 'product-barcode-alias',
    id: productId,
  });
  const queues = new Map<string, Promise<unknown>>();
  const formKey = (storeId: string, productId: string) => ({
    ...key(storeId, productId),
    flow: 'product-barcode-alias-form',
  });
  const enqueue = (storeId: string, productId: string, work: () => Promise<void>) => {
    const id = JSON.stringify(formKey(storeId, productId));
    const task = (queues.get(id) ?? Promise.resolve()).then(work);
    queues.set(
      id,
      task.catch(() => undefined),
    );
    return task;
  };
  return {
    async readForm(storeId, productId) {
      const scope = formKey(storeId, productId);
      await queues.get(JSON.stringify(scope));
      const saved = await drafts.get<BarcodeAliasFormDraft>(scope);
      if (saved && saved.data.schemaVersion !== 1)
        throw appError('BusinessRule', 'DRAFT_SCHEMA_UNSUPPORTED', '');
      return saved?.data ?? null;
    },
    writeForm(storeId, productId, value) {
      const scope = formKey(storeId, productId);
      return enqueue(storeId, productId, async () => {
        await drafts.put(scope, value);
      });
    },
    removeForm(storeId, productId) {
      const scope = formKey(storeId, productId);
      return enqueue(storeId, productId, () => drafts.remove(scope));
    },
    async read(storeId, productId) {
      const saved = await drafts.get<BarcodeAliasIntent>(key(storeId, productId));
      if (saved && saved.data.schemaVersion !== 1)
        throw appError('BusinessRule', 'DRAFT_SCHEMA_UNSUPPORTED', '', { messageSource: 'fallback' });
      return saved?.data ?? null;
    },
    async write(storeId, productId, intent) {
      await drafts.put(key(storeId, productId), intent);
    },
    remove: (storeId, productId) => drafts.remove(key(storeId, productId)),
  };
};
