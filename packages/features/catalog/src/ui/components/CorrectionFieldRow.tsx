'use client';
import { Checkbox } from '@dukani/ui-kit';
import type { CorrectionField } from '../../domain/correction.types';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { useCorrectionPresentation } from '../i18n/use-correction-presentation';
import { CorrectionValueInput } from './CorrectionValueInput';

/** One correctable field: marked as wrong, then its correct value; the current value stays visible. */
export function CorrectionFieldRow({
  field,
  selected,
  value,
  message,
  disabled,
  onToggle,
  onChange,
}: {
  field: CorrectionField;
  selected: boolean;
  value: string;
  message?: string;
  disabled: boolean;
  onToggle: (on: boolean) => void;
  onChange: (value: string) => void;
}) {
  const t = useCatalogTexts();
  const presentation = useCorrectionPresentation();
  const current = presentation.value(field, field.currentValue) ?? field.currentName;
  return (
    <div className="border-line flex flex-col gap-3 border-b pb-3 last:border-b-0">
      <Checkbox
        checked={selected}
        disabled={disabled}
        onChange={onToggle}
        label={presentation.label(field.key, field)}
        description={current ? t('correction.current', { value: current }) : t('correction.currentEmpty')}
      />
      {selected ? (
        <CorrectionValueInput
          field={field}
          value={value}
          onChange={onChange}
          disabled={disabled}
          label={t('correction.proposed')}
          message={message}
        />
      ) : null}
    </div>
  );
}
