'use client';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import type { AttachmentRecordCardProps } from '../types/AttachmentRecordCard.types';

export function AttachmentRecordCard({ title, codes, membership, unit, alias }: AttachmentRecordCardProps) {
  const t = useAttachmentTranslations();
  return (
    <section className="bg-surface border-line flex flex-col gap-3 rounded-md border p-4">
      {title}
      <div className="text-body-s text-fg-secondary">
        {t('original')}: {codes}
      </div>
      <p className="text-body-s text-fg-secondary">{membership}</p>
      {unit}
      {alias}
    </section>
  );
}
