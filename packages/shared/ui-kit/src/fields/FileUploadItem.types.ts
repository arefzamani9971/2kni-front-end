import type { FileUploadFieldProps, PickedFile } from './FileUploadField.types';

export type FileUploadItemProps = {
  file: PickedFile;
  images?: boolean;
  /** Object URL of the thumbnail (image mode). */
  url?: string;
  state?: ReturnType<NonNullable<FileUploadFieldProps['fileState']>>;
  onPrimary: () => void;
  onRemove: () => void;
};
