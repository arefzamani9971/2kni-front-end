'use client';
import { useEffect } from 'react';
import { FileUploadField } from '@dukani/ui-kit';
import { MAX_EVIDENCE } from '../../domain/correction';
import type { EvidenceFile } from '../../domain/correction.types';
import { useEvidenceUploads } from '../hooks/use-evidence-uploads';
import { useCatalogTexts } from '../i18n/use-catalog-translations';

/** Photo or PDF evidence (≤10 files of 10 MB), uploaded as picked; the parent receives files and their ids. */
export function EvidenceField({
  initial,
  onChange,
  disabled,
  message,
}: {
  initial?: readonly EvidenceFile[];
  onChange: (files: readonly EvidenceFile[]) => void;
  disabled: boolean;
  message?: string;
}) {
  const t = useCatalogTexts();
  const uploads = useEvidenceUploads(initial ?? []);
  useEffect(() => onChange(uploads.files), [uploads.files, onChange]);
  return (
    <fieldset disabled={disabled}>
      <FileUploadField
        label={t('correction.evidence')}
        optional
        hint={t('correction.evidenceHint')}
        value={uploads.files}
        onChange={uploads.change}
        fileState={uploads.fileState}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        maxFiles={MAX_EVIDENCE}
        maxSizeMb={10}
        status={message ? 'error' : undefined}
        message={message}
      />
    </fieldset>
  );
}
