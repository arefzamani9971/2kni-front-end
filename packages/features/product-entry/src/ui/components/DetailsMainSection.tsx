'use client';
import type { Dto } from '@dukani/contracts';
import { Alert, Button, Section, SelectField, TextField } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { BRAND_NONE, BRAND_UNKNOWN } from './NewItemDetails.constants';
import type { DetailsForm } from './NewItemDetails.types';
import { SimilarItem } from './SimilarItem';

/** «مشخصات اصلی»: distinct title with similar items, product type, brand and base sales unit. */
export function DetailsMainSection({
  form,
  types,
  typesPending,
  productType,
  selectionBusy,
  brands,
  titleCheck,
  onSelectType,
  onCreateType,
  onChooseBrand,
  onPickSimilar,
}: {
  form: DetailsForm;
  types: readonly Dto<'ProductTypeSummaryDto'>[];
  typesPending: boolean;
  productType: Dto<'ProductTypeDto'> | undefined;
  selectionBusy: boolean;
  brands: readonly { readonly id: string; readonly name: string }[];
  titleCheck: Dto<'TitleCheckDto'> | undefined;
  onSelectType: (id: string) => void;
  onCreateType?: (name: string) => void;
  onChooseBrand: () => void;
  onPickSimilar: (item: Dto<'CatalogItemSummaryDto'>) => Promise<void>;
}) {
  const t = useEntryTranslations();
  const similar = titleCheck?.similarItems ?? [];
  const typeId = form.watch('productTypeId');
  const unit = productType?.allowedUnits.find((u) => u.id === form.watch('baseUnitId'));
  return (
    <Section title={t('mainDetails')}>
      <div className="desktop:grid-cols-3 grid gap-4">
        <form.Field name="title">
          {(f) => (
            <TextField
              {...f}
              label={t('distinctName')}
              required
              maxLength={250}
              placeholder={t('nameExample')}
            />
          )}
        </form.Field>
        {similar.length > 0 ? (
          <Alert
            tone={titleCheck?.isAvailable ? 'warning' : 'danger'}
            title={titleCheck?.isAvailable ? t('similarCatalog') : t('titleExists')}
            description={
              <div className="flex flex-col gap-2">
                <span>{t('selectExistingHint')}</span>
                {similar.slice(0, 3).map((it) => (
                  <SimilarItem key={it.id} item={it} onPick={() => onPickSimilar(it)} />
                ))}
              </div>
            }
          />
        ) : null}
        <form.Field name="productTypeId">
          {(f) => (
            <SelectField
              {...f}
              label={t('productType')}
              required
              searchable
              placeholder={typesPending ? t('loading') : t('chooseType')}
              options={types.map((type) => ({
                value: type.id,
                label: type.name,
                description: type.categoryName ?? undefined,
              }))}
              disabled={selectionBusy}
              onChange={onSelectType}
              createAction={onCreateType ? { label: t('createType'), onSelect: onCreateType } : undefined}
            />
          )}
        </form.Field>
        <form.Field name="brand">
          {(field) => (
            <div className="flex flex-col gap-2">
              <span className="text-body-s text-fg-secondary">{t('brand')}</span>
              <Button type="button" block variant="secondary" onClick={onChooseBrand}>
                {brands.find((brand) => brand.id === field.value)?.name ??
                  (field.value === BRAND_NONE
                    ? t('unbranded')
                    : field.value === BRAND_UNKNOWN
                      ? t('unknownBrand')
                      : t('selectBrand'))}
              </Button>
              {field.message ? (
                <p role="alert" className="text-body-s text-danger">
                  {field.message}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>
        <form.Field name="baseUnitId">
          {(f) => (
            <SelectField
              {...f}
              label={t('baseSalesUnit')}
              required
              disabled={!productType}
              placeholder={typeId ? t('chooseUnit') : t('chooseTypeFirst')}
              options={(productType?.allowedUnits ?? []).map((u) => ({
                value: u.id,
                label: `${u.name}${u.id === productType?.defaultBaseUnit.id ? t('suggestedType') : ''}`,
              }))}
              hint={unit && unit.maxDecimals > 0 ? t('decimalUnitHint') : undefined}
            />
          )}
        </form.Field>
      </div>
    </Section>
  );
}
