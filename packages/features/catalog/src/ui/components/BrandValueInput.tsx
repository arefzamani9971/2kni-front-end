'use client';
import { SelectField } from '@dukani/ui-kit';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import type { CorrectionValueInputProps } from './CorrectionValueInput.types';

/**
 * Brand of a public item: only public brands are offered (the server rejects a store's private brand, which would
 * leak into the catalog). The sheet searches the list; the current brand stays selectable by its name.
 */
export function BrandValueInput({
  field,
  value,
  onChange,
  disabled,
  label,
  message,
}: CorrectionValueInputProps) {
  const t = useCatalogTexts();
  const brands = useCatalogQuery(['brands'], (port, storeId, signal) =>
    port.brands(storeId, undefined, signal),
  );
  const options = (brands.data ?? [])
    .filter((b) => b.status === 'Public')
    .map((b) => ({ value: b.id, label: b.name }));
  if (field.currentValue && field.currentName && !options.some((o) => o.value === field.currentValue))
    options.unshift({ value: field.currentValue, label: field.currentName });
  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled || brands.isPending}
      searchable
      sheetTitle={t('correction.searchBrand')}
      options={field.clearable ? [{ value: '', label: t('correction.noValue') }, ...options] : options}
      status={message ? 'error' : undefined}
      message={message}
    />
  );
}
