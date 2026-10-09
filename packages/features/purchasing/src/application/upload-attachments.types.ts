import type { FileUploader } from './ports';
export type AttachmentSelection = { readonly id: string; readonly file: File };
export type AttachmentUploadState = 'uploading' | 'failed' | 'done';
export type UploadedAttachment = { readonly file: File; readonly fileId: string };
export type AttachmentUploadDependencies = {
  readonly uploader: FileUploader;
  readonly purchaseId: string;
  readonly storeId: string;
};
