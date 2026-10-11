import type { Api } from '@dukani/http';
import type { CorrectionPort } from '../application/correction-port.types';
import type { CorrectionReply } from '../domain/correction.types';

/** The generated DTOs take mutable arrays and records; the feature's models are read-only. */
const replyBody = (body: CorrectionReply) => ({
  message: body.message,
  evidenceFileIds: [...body.evidenceFileIds],
});

export const createHttpCorrections = (api: Api): CorrectionPort => ({
  capabilities: (storeId, itemId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/items/{itemId}/correction-capabilities', {
      path: { storeId, itemId },
      signal,
    }),
  create: (storeId, itemId, body, operationId) =>
    api.post('/api/v1/stores/{storeId}/catalog/items/{itemId}/corrections', {
      path: { storeId, itemId },
      body: {
        proposedChanges: { ...body.proposedChanges },
        reason: body.reason,
        evidenceFileIds: [...body.evidenceFileIds],
      },
      operationId,
    }),
  get: (storeId, correctionId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/corrections/{correctionId}', {
      path: { storeId, correctionId },
      signal,
    }),
  reply: (storeId, correctionId, body) =>
    api.post('/api/v1/stores/{storeId}/catalog/corrections/{correctionId}/reply', {
      path: { storeId, correctionId },
      body: replyBody(body),
    }),
  appeal: (storeId, correctionId, body) =>
    api.post('/api/v1/stores/{storeId}/catalog/corrections/{correctionId}/appeal', {
      path: { storeId, correctionId },
      body: replyBody(body),
    }),
  withdraw: (storeId, correctionId) =>
    api.post('/api/v1/stores/{storeId}/catalog/corrections/{correctionId}/withdraw', {
      path: { storeId, correctionId },
    }),
  uploadEvidence: (storeId, file, signal) => {
    const form = new FormData();
    form.append('File', file);
    form.append('Kind', 'CorrectionEvidence');
    return api.post('/api/v1/stores/{storeId}/files', { path: { storeId }, form, signal });
  },
});
