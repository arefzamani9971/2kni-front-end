'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { Alert, Button, Overlay, SelectField } from '@dukani/ui-kit';
import type { EntrySearchFilters } from '../../../application/ports';
import { useProductEntryModule } from '../../../module';
import { useEntryTranslations } from '../../i18n/use-entry-translations';

import { categoryOptions } from '../../common/presentation/category-options';

/** Catalog search filters (group, type, brand); their options load only while the dialog is open. */
export function SearchFiltersDialog({
  open,
  onOpenChange,
  filters,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: EntrySearchFilters;
  onChange: (filters: EntrySearchFilters) => void;
}) {
  const t = useEntryTranslations();
  const store = useActiveStore();
  const { catalog } = useProductEntryModule();
  const categories = useAppQuery({
    queryKey: ['entry-filters', store.id, 'categories'],
    enabled: open,
    queryFn: ({ signal }) => catalog.categories(store.id, signal),
  });
  const types = useAppQuery({
    queryKey: ['entry-filters', store.id, 'types'],
    enabled: open,
    queryFn: ({ signal }) => catalog.productTypes(store.id, signal),
  });
  const brands = useAppQuery({
    queryKey: ['entry-filters', store.id, 'brands'],
    enabled: open,
    queryFn: ({ signal }) => catalog.brands(store.id, signal),
  });
  return (
    <Overlay
      open={open}
      onOpenChange={onOpenChange}
      title={t('searchFilters')}
      actions={<Button onClick={() => onOpenChange(false)}>{t('back')}</Button>}
    >
      {categories.error || types.error || brands.error ? <Alert tone="danger" title={t('retry')} /> : null}
      <SelectField
        label={t('categoryFilter')}
        optional
        value={filters.categoryId ?? ''}
        options={categoryOptions(categories.data ?? [])}
        onChange={(categoryId) => onChange({ ...filters, categoryId })}
      />
      <SelectField
        label={t('productType')}
        optional
        value={filters.productTypeId ?? ''}
        options={(types.data ?? []).map((v) => ({ value: v.id, label: v.name }))}
        onChange={(productTypeId) => onChange({ ...filters, productTypeId })}
      />
      <SelectField
        label={t('brand')}
        optional
        value={filters.brandId ?? ''}
        options={(brands.data ?? []).map((v) => ({ value: v.id, label: v.name }))}
        onChange={(brandId) => onChange({ ...filters, brandId })}
      />
      <Button variant="secondary" onClick={() => onChange({})}>
        {t('clearFilters')}
      </Button>
    </Overlay>
  );
}
