import type { createAttachmentUploader } from '../../application/upload-attachments';
import type { AppError } from '@dukani/domain';
import type { AttachmentUploadState } from '../../application/upload-attachments.types';
export type UploadState = Record<string, AttachmentUploadState>;
export type AttachmentError = AppError | 'uploadFailed' | 'attachmentFailed';

export type AttachmentUploadSession = {
  readonly key: string;
  readonly upload: ReturnType<typeof createAttachmentUploader>;
};
