'use client';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import type { AttachmentRecordCodesProps } from '../types/AttachmentRecordCodes.types';

export function AttachmentRecordCodes({ unit }: AttachmentRecordCodesProps) {
  const t = useAttachmentTranslations();
  return (
    <span className="text-body-s break-all" dir="ltr">
      {unit?.barcodes.map((code) => code.code).join(' · ') || t('noCode')}
    </span>
  );
}
