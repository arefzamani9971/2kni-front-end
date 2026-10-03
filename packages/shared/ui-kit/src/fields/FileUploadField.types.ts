import type { ReactNode } from 'react';
import type { Status } from '../lib/types';

export type PickedFile = { readonly id: string; readonly file: File; readonly primary?: boolean };

export type FileUploadFieldProps = {
  label: ReactNode;
  value: readonly PickedFile[];
  onChange: (files: PickedFile[]) => void;
  /** e.g. 'image/jpeg,image/png,image/webp' or 'application/pdf,image/*'. */
  accept: string;
  maxFiles?: number;
  maxSizeMb?: number;
  /** Image mode: thumbnails and «اصلی» selection (BIZ-CAT-02: up to 8 images, 10MB). */
  images?: boolean;
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  /** Per-file upload state shown by the owner feature (uploading/failed with retry). */
  fileState?: (id: string) => { state: 'uploading' | 'failed' | 'done'; onRetry?: () => void } | undefined;
  className?: string;
};
