import type { OperationId } from '@dukani/domain';
import type {
  CorrectionCapabilities,
  CorrectionReply,
  CorrectionRequest,
  NewCorrection,
} from '../domain/correction.types';

/** Port to the store's catalog correction requests (CAT-CORRECTION, F11 §4–§7). */
export type CorrectionPort = {
  capabilities(storeId: string, itemId: string, signal?: AbortSignal): Promise<CorrectionCapabilities>;
  /** Idempotent: the operation id is the Idempotency-Key; a replay returns the first result. */
  create(
    storeId: string,
    itemId: string,
    body: NewCorrection,
    operationId: OperationId,
  ): Promise<CorrectionRequest>;
  get(storeId: string, correctionId: string, signal?: AbortSignal): Promise<CorrectionRequest>;
  reply(storeId: string, correctionId: string, body: CorrectionReply): Promise<CorrectionRequest>;
  appeal(storeId: string, correctionId: string, body: CorrectionReply): Promise<CorrectionRequest>;
  withdraw(storeId: string, correctionId: string): Promise<CorrectionRequest>;
  /** Photo or PDF evidence, stored privately for the store (upload kind CorrectionEvidence). */
  uploadEvidence(storeId: string, file: File, signal?: AbortSignal): Promise<{ readonly fileId: string }>;
};
