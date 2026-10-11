'use client';
import { DecimalField, SelectField, TextArea, TextField } from '@dukani/ui-kit';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { BrandValueInput } from './BrandValueInput';
import type { CorrectionValueInputProps } from './CorrectionValueInput.types';
import { MultiOptionInput } from './MultiOptionInput';

/** The proposed value of one correction field, edited the way its server value type requires (F11 §4). */
export function CorrectionValueInput(props: CorrectionValueInputProps) {
  const t = useCatalogTexts();
  const { field, value, onChange, disabled, label, message } = props;
  const status = message ? ('error' as const) : undefined;
  const hint = field.clearable ? t('correction.clearHint') : undefined;
  const choices = (options: readonly { value: string; label: string }[]) =>
    field.clearable ? [{ value: '', label: t('correction.noValue') }, ...options] : options;
  switch (field.valueType) {
    case 'LongText':
      return (
        <TextArea
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={3}
          maxLength={field.maxLength ?? undefined}
          showCount
          status={status}
          message={message}
          hint={hint}
        />
      );
    case 'Number':
      return (
        <DecimalField
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxDecimals={3}
          status={status}
          message={message}
          hint={hint}
        />
      );
    case 'Bool':
      return (
        <SelectField
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          options={choices([
            { value: 'true', label: t('correction.yes') },
            { value: 'false', label: t('correction.no') },
          ])}
          status={status}
          message={message}
        />
      );
    case 'Option':
    case 'Unit':
      return (
        <SelectField
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          options={choices(field.allowedValues.map((o) => ({ value: o.value, label: o.name })))}
          status={status}
          message={message}
        />
      );
    case 'MultiOption':
      return <MultiOptionInput {...props} />;
    case 'Brand':
      return <BrandValueInput {...props} />;
    default:
      return (
        <TextField
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={field.maxLength ?? undefined}
          status={status}
          message={message}
          hint={hint}
        />
      );
  }
}
