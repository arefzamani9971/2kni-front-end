import type { Dto } from '@dukani/contracts';
import { DecimalField, SelectField, TextField } from '@dukani/ui-kit';

export function AttributeField({
  attribute: a,
  value,
  error,
  onChange,
}: {
  attribute: Dto<'ProductTypeAttributeDto'>;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const common = { label: a.name, required: a.isRequired, optional: !a.isRequired, status: error ? ('error' as const) : undefined, message: error || undefined };
  if (a.dataType === 'Option' || a.dataType === 'MultiOption')
    return (
      <SelectField
        {...common}
        value={value}
        onChange={onChange}
        searchable={a.options.length > 8}
        options={a.options.filter((o) => !o.isArchived).map((o) => ({ value: o.id, label: o.value }))}
      />
    );
  if (a.dataType === 'Number') return <DecimalField {...common} value={value} onChange={onChange} maxDecimals={3} />;
  if (a.dataType === 'Bool')
    return (
      <SelectField
        {...common}
        value={value}
        onChange={onChange}
        options={[
          { value: 'true', label: 'بله' },
          { value: 'false', label: 'خیر' },
        ]}
      />
    );
  return <TextField {...common} value={value} onChange={onChange} maxLength={100} />;
}
