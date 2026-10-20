'use client';
import { memo } from 'react';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import { AttachmentRecordAlias } from './AttachmentRecordAlias';
import { AttachmentRecordCard } from './AttachmentRecordCard';
import { AttachmentRecordCodes } from './AttachmentRecordCodes';
import { AttachmentRecordTitle } from './AttachmentRecordTitle';
import { AttachmentRecordUnitField } from './AttachmentRecordUnitField';
import type { AttachmentRecordContentProps } from '../types/AttachmentRecordContent.types';
import type { AttachmentRecordCardProps } from '../types/AttachmentRecordCard.types';

/** Memoization is per row/field, so changing one selection leaves the other inputs untouched. */
export const AttachmentRecordContent = memo(function AttachmentRecordContent({
  candidate,
  selected,
  disabled,
  onChange,
  part,
}: AttachmentRecordContentProps) {
  const t = useAttachmentTranslations();
  const { item, units } = candidate;
  const unit =
    units.find((entry) => entry.id === selected?.row.catalogItemUnitId) ??
    units.find((entry) => entry.kind === 'Base') ??
    units[0];
  const fieldsDisabled = disabled || !selected;
  const content: AttachmentRecordCardProps = {
    title: <AttachmentRecordTitle item={item} />,
    codes: <AttachmentRecordCodes unit={unit} />,
    unit: (
      <AttachmentRecordUnitField
        itemId={item.id}
        units={units}
        value={unit?.id}
        disabled={fieldsDisabled}
        onChange={onChange}
      />
    ),
    membership: t(item.myStoreProductId ? 'member' : 'available'),
    alias: (
      <AttachmentRecordAlias
        item={item}
        value={selected?.row.localBarcode ?? ''}
        disabled={fieldsDisabled}
        onChange={onChange}
      />
    ),
  };

  return part === 'card' ? <AttachmentRecordCard {...content} /> : content[part];
});
