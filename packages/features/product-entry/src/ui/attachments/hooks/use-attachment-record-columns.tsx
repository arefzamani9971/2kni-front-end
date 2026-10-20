'use client';
import { useCallback } from 'react';
import { useGridColumns } from '@dukani/ui-kit';
import type { AttachmentCandidate, AttachmentSort } from '../../../domain/catalog-attachment.types';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import { AttachmentRecordCell } from '../components/AttachmentRecordCell';
import { ATTACHMENT_RECORD_COLUMNS } from '../constants/attachment-record-columns.constants';
import type {
  AttachmentHeaderKey,
  AttachmentRecordColumnId,
  AttachmentRecordColumnsOptions,
} from '../types/attachment-columns.types';

export function useAttachmentRecordColumns({
  selection,
  disabled,
  onChange,
}: AttachmentRecordColumnsOptions) {
  const t = useAttachmentTranslations();
  const renderCell = useCallback(
    (candidate: AttachmentCandidate, part: AttachmentRecordColumnId) => (
      <AttachmentRecordCell
        candidate={candidate}
        selection={selection}
        disabled={disabled}
        onChange={onChange}
        part={part}
      />
    ),
    [selection, disabled, onChange],
  );
  return useGridColumns<AttachmentCandidate, AttachmentRecordColumnId, AttachmentHeaderKey, AttachmentSort>({
    definitions: ATTACHMENT_RECORD_COLUMNS,
    translate: t,
    renderCell,
  });
}
