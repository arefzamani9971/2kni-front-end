'use client';
import { useEffect } from 'react';
import { FileUploadField } from '@dukani/ui-kit';
import type { CorrectionDraft } from '../../domain/correction-draft.types';
import { useImageUploads } from '../hooks/use-image-uploads';
import { useEntryTranslations } from '../i18n/use-entry-translations';
export function CorrectionEvidence({
  initial,
  onChange,
  disabled,
}: {
  initial: CorrectionDraft['evidence'];
  onChange: (evidence: NonNullable<CorrectionDraft['evidence']>) => void;
  disabled: boolean;
}) {
  const uploads = useImageUploads(initial ?? []);
  const t = useEntryTranslations();
  useEffect(() => onChange(uploads.images), [uploads.images, onChange]);
  return (
    <fieldset disabled={disabled}>
      <FileUploadField
        label={t('correction.evidence')}
        images
        value={uploads.images}
        onChange={uploads.change}
        fileState={uploads.fileState}
        accept="image/jpeg,image/png,image/webp"
        maxFiles={10}
        maxSizeMb={10}
      />
    </fieldset>
  );
}
