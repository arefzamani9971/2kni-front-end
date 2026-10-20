'use client';
import { SelectField } from '@dukani/ui-kit';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import type { AttachmentRecordUnitFieldProps } from '../types/AttachmentRecordUnitField.types';

export function AttachmentRecordUnitField({
  itemId,
  units,
  value,
  disabled,
  onChange,
}: AttachmentRecordUnitFieldProps) {
  const t = useAttachmentTranslations();
  return (
    <SelectField
      label={t('unit')}
      classNames={{ label: 'desktop:sr-only', root: 'min-w-24' }}
      value={value}
      options={units.map((entry) => ({ value: entry.id, label: entry.name }))}
      disabled={disabled}
      onChange={(catalogItemUnitId) => onChange(itemId, { catalogItemUnitId })}
    />
  );
}
