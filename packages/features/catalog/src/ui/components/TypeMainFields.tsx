'use client';
import { SelectField, TextField } from '@dukani/ui-kit';
import type { CatalogCategory, CatalogUnit } from '../../domain/catalog.types';
import { flattenCategories } from '../../domain/categories';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import type { TypeForm } from './CreateTypeForm.types';

/** Name, group (with in-place creation) and default base unit of a new product type (Figma categorynew). */
export function TypeMainFields({
  form,
  categories,
  units,
  disabled,
  onCreateCategory,
}: {
  form: TypeForm;
  categories: readonly CatalogCategory[] | undefined;
  units: readonly CatalogUnit[] | undefined;
  disabled: boolean;
  onCreateCategory: (name: string) => void;
}) {
  const t = useCatalogTexts();
  return (
    <div className="desktop:bg-surface desktop:border-line desktop:grid desktop:grid-cols-3 desktop:rounded-lg desktop:border desktop:p-6 flex flex-col gap-4">
      <form.Field name="name">
        {(field) => <TextField {...field} label={t('name')} required maxLength={120} disabled={disabled} />}
      </form.Field>
      <form.Field name="categoryId">
        {(field) => (
          <SelectField
            {...field}
            label={t('group')}
            optional
            createAction={{ label: t('newCategory'), onSelect: onCreateCategory }}
            options={[
              { value: '', label: t('noCategory') },
              ...flattenCategories(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
            ]}
            disabled={disabled || !categories}
          />
        )}
      </form.Field>
      <TextField label={t('suggestedAttribute')} disabled hint={t('notReleased')} />
      <div
        aria-hidden="true"
        className="border-line desktop:col-span-3 desktop:block desktop:border-t hidden"
      />
      <form.Field name="defaultBaseUnitId">
        {(field) => (
          <SelectField
            {...field}
            label={t('baseUnit')}
            required
            options={(units ?? []).map((u) => ({ value: u.id, label: u.name }))}
            disabled={disabled || !units}
          />
        )}
      </form.Field>
      <p className="text-body-m text-fg-secondary desktop:col-span-2">{t('unitHint')}</p>
    </div>
  );
}
