'use client';
import type { Dto } from '@dukani/contracts';
import { useFieldValue } from '@dukani/forms';
import { Button, Section, SelectField, TextField } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { BRAND_NONE, BRAND_UNKNOWN } from '../constants/NewItemDetails.constants';
import type { DetailsForm } from '../types/NewItemDetails.types';
import { TitleSimilarItems } from './TitleSimilarItems';

/** «مشخصات اصلی»: distinct title with similar items, product type, brand and base sales unit. */
export function DetailsMainSection({
  form,
  types,
  typesPending,
  productType,
  selectionBusy,
  brands,
  titleAvailabilityRef,
  onSelectType,
  onCreateType,
  onChooseBrand,
  onPickSimilar,
  registrationOnly = false,
}: {
  form: DetailsForm;
  types: readonly Dto<'ProductTypeSummaryDto'>[];
  typesPending: boolean;
  productType: Dto<'ProductTypeDto'> | undefined;
  selectionBusy: boolean;
  brands: readonly { readonly id: string; readonly name: string }[];
  titleAvailabilityRef: { current: boolean };
  onSelectType: (id: string) => void;
  onCreateType?: (name: string) => void;
  onChooseBrand: () => void;
  onPickSimilar: (item: Dto<'CatalogItemSummaryDto'>) => Promise<void>;
  registrationOnly?: boolean;
}) {
  const t = useEntryTranslations();
  // discrete choices only: the title is followed by its own leaf
  const typeId = useFieldValue(form, 'productTypeId');
  const baseUnitId = useFieldValue(form, 'baseUnitId');
  const unit = productType?.allowedUnits.find((u) => u.id === baseUnitId);
  return (
    <Section title={t('mainDetails')}>
      <div className={registrationOnly ? 'desktop:grid-cols-2 grid gap-4' : 'desktop:grid-cols-3 grid gap-4'}>
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
        <TitleSimilarItems form={form} availabilityRef={titleAvailabilityRef} onPickSimilar={onPickSimilar} />
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
