import type { ReactNode } from 'react';

export type UploadAreaProps = {
  /** Card title, e.g. «عکس فروشگاه (اختیاری)». */
  title: ReactNode;
  /** Body line, e.g. «انتخاب یا تغییر تصویر فروشگاه». */
  description?: ReactNode;
  /** The chosen file (kept by the owner feature until it is uploaded). */
  value: File | null;
  onChange: (file: File | null) => void;
  /** Image already saved on the server, shown while no new file is chosen. */
  currentUrl?: string | null;
  accept?: string;
  maxSizeMb?: number;
  /** Error from the owner (e.g. a failed upload). */
  message?: ReactNode;
  disabled?: boolean;
  className?: string;
};
