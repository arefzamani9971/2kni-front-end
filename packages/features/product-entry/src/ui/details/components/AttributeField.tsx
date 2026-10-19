import { createBooleanOptions } from '../constants/AttributeField.constants';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import type { AttributeEditorValue } from '../../../domain/attribute-values.types';
import type { Dto } from '@dukani/contracts';
import { Checkbox, DecimalField, SelectField, TextField } from '@dukani/ui-kit';

export function AttributeField({
  attribute: a,
  value,
  error,
  obsolete = false,
  onChange,
}: {
  attribute: Dto<'ProductTypeAttributeDto'>;
  value: AttributeEditorValue;
  error?: string;
  obsolete?: boolean;
  onChange: (v: AttributeEditorValue) => void;
}) {
  const t = useEntryTranslations();

  const common = {
    label: obsolete ? t('obsoleteAttributeLabel', { name: a.name }) : a.name,
    required: a.isRequired,
    optional: !a.isRequired,
    status: error ? ('error' as const) : undefined,
    message: error || undefined,
  };
  if (a.dataType === 'MultiOption') {
    const selected = typeof value === 'string' ? (value ? [value] : []) : value;
    return (
      <fieldset aria-invalid={!!error} className="flex flex-col gap-2">
        <legend className="text-label-m">{common.label}</legend>
        {a.options
          .filter((o) => !o.isArchived || selected.includes(o.id))
          .map((o) => (
            <Checkbox
              key={o.id}
              label={o.isArchived ? t('archivedAttributeOption', { value: o.value }) : o.value}
              checked={selected.includes(o.id)}
              disabled={o.isArchived && !selected.includes(o.id)}
              onChange={(checked) =>
                onChange(checked ? [...selected, o.id] : selected.filter((id) => id !== o.id))
              }
            />
          ))}
        {error ? (
          <p role="alert" className="text-danger text-body-s">
            {error}
          </p>
        ) : null}
      </fieldset>
    );
  }
  const textValue = typeof value === 'string' ? value : (value[0] ?? '');
  if (a.dataType === 'Option')
    return (
      <SelectField
        {...common}
        value={textValue}
        onChange={onChange}
        searchable={a.options.length > 8}
        options={a.options
          .filter((o) => !o.isArchived || o.id === textValue)
          .map((o) => ({
            value: o.id,
            label: o.isArchived ? t('archivedAttributeOption', { value: o.value }) : o.value,
            disabled: o.isArchived,
          }))}
      />
    );
  if (a.dataType === 'Number')
    return (
      <DecimalField {...common} value={textValue} onChange={onChange} maxDecimals={null} allowNegative />
    );
  if (a.dataType === 'Bool')
    return (
      <SelectField {...common} value={textValue} onChange={onChange} options={createBooleanOptions(t)} />
    );
  return <TextField {...common} value={textValue} onChange={onChange} maxLength={250} />;
}
