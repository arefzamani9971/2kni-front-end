import type { DraftStore } from '@dukani/platform';
import type { ReceiptDrafts } from '../application/receipt.ports';
import type { ContinuousDraft } from '../domain/continuous-purchase.types';
import type { OpeningQueue } from '../domain/opening-queue.types';
import { CONTINUOUS_DRAFT_ID, CONTINUOUS_FLOW, OPENING_FLOW } from './receipt-draft-repository.constants';

/** Drafts of the receipt flows in the DraftStore, keyed by store, user, flow and id; unknown schemas are not read. */
export const createReceiptDrafts = (drafts: DraftStore, userId: () => string): ReceiptDrafts => {
  const key = (storeId: string, flow: string, id: string) => ({ storeId, userId: userId(), flow, id });
  const read = async <T extends { schemaVersion: number }>(storeId: string, flow: string, id: string) => {
    const saved = (await drafts.get<T>(key(storeId, flow, id)))?.data;
    if (saved && saved.schemaVersion !== 1) throw new Error('DRAFT_SCHEMA_UNSUPPORTED');
    return saved ?? null;
  };
  return {
    continuous: (storeId) => read<ContinuousDraft>(storeId, CONTINUOUS_FLOW, CONTINUOUS_DRAFT_ID),
    saveContinuous: async (storeId, draft) => {
      await drafts.put(key(storeId, CONTINUOUS_FLOW, CONTINUOUS_DRAFT_ID), draft);
    },
    queue: (storeId, id) => read<OpeningQueue>(storeId, OPENING_FLOW, id),
    saveQueue: async (storeId, queue) => {
      await drafts.put(key(storeId, OPENING_FLOW, queue.id), queue);
    },
  };
};
