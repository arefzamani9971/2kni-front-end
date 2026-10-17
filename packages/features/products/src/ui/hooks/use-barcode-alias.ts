'use client';
import { useEffect, useRef } from 'react';
import { appError } from '@dukani/domain';
import type {
  BarcodeAliasRequest,
  BarcodeAliasConfirmation,
  BarcodeAliasResult,
} from '../../domain/barcode-alias.types';
import { useAppQuery, useFinalCommand, useQueryCache } from '@dukani/data';
import { useActiveStore, useCan } from '@dukani/platform';
import { useProductsModule } from '../../module';

/** Persist the exact confirmed request before dispatch. Refresh and retry reuse its operation id. */
export function useBarcodeAlias(productId: string) {
  const store = useActiveStore();
  const allowed = useCan('product.manage');
  const { barcodeAliases, barcodeAliasDrafts } = useProductsModule();
  const cache = useQueryCache();
  const key = ['barcode-alias-intent', store.id, productId];
  const pending = useAppQuery({
    queryKey: key,
    queryFn: () => barcodeAliasDrafts.read(store.id, productId),
    enabled: allowed,
    staleTime: Infinity,
  });
  const sent = useRef(new Set<string>());
  const command = useFinalCommand<BarcodeAliasConfirmation, BarcodeAliasResult>({
    operationId: pending.data?.operationId,
    async run(payload, operationId) {
      if (!allowed) throw appError('Permission', 'PERMISSION_DENIED', '');
      if (!sent.current.has(operationId) && pending.data?.operationId !== operationId) {
        const intent = { schemaVersion: 1 as const, operationId, payload };
        await barcodeAliasDrafts.write(store.id, productId, intent);
        cache.set(key, intent);
        sent.current.add(operationId);
      }
      return barcodeAliases.commit(store.id, productId, payload, operationId);
    },
    async onSuccess() {
      cache.set(key, null);
      await barcodeAliasDrafts.remove(store.id, productId);
      await barcodeAliasDrafts.removeForm(store.id, productId);
      cache.set(['barcode-alias-form', store.id, productId], null);
    },
    // the catalog list's barcode filter and the entry lookup both see store aliases
    invalidates: [
      ['products', store.id],
      ['catalog', store.id],
      ['entry', store.id],
    ],
  });
  useEffect(() => {
    if (command.state.kind !== 'failed') return;
    cache.set(['barcode-alias-intent', store.id, productId], null);
    void barcodeAliasDrafts.remove(store.id, productId).catch(() => undefined);
  }, [command.state.kind, barcodeAliasDrafts, store.id, productId, cache]);
  const restored = !!pending.data;
  return {
    ...command,
    allowed,
    pendingIntent: pending.data,
    loading: pending.isPending,
    recoveryError: pending.error,
    unknown: command.state.kind === 'unknown' || (restored && command.state.kind === 'idle'),
    preview: (body: BarcodeAliasRequest) => barcodeAliases.preview(store.id, productId, body),
    recover: () => (restored ? command.submit(pending.data!.payload) : command.retry()),
    reload: () => pending.refetch(),
  };
}
