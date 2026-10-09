import type {
  AttachmentSelection,
  AttachmentUploadDependencies,
  AttachmentUploadState,
  UploadedAttachment,
} from './upload-attachments.types';
/** Retains successful uploads for retries within one receipt's editing session. */
export function createAttachmentUploader({ uploader, storeId, purchaseId }: AttachmentUploadDependencies) {
  const uploaded = new Map<string, UploadedAttachment>();
  return async (
    selection: readonly AttachmentSelection[],
    onState: (id: string, state: AttachmentUploadState) => void,
  ) => {
    const ids: string[] = [];
    for (const item of selection) {
      const key = `${purchaseId}:${item.id}`;
      let saved = uploaded.get(key);
      if (saved?.file !== item.file) {
        onState(item.id, 'uploading');
        try {
          saved = {
            file: item.file,
            fileId: (await uploader.upload(storeId, item.file, 'PurchaseAttachment')).fileId,
          };
          uploaded.set(key, saved);
        } catch (error) {
          onState(item.id, 'failed');
          throw error;
        }
      }
      ids.push(saved.fileId);
      onState(item.id, 'done');
    }
    return ids;
  };
}
