'use client';
import { useValidationRules } from '@dukani/forms';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import type { Dto } from '@dukani/contracts';
import { decimal } from '@dukani/domain';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import { Alert, BarcodeField, Button, ListRow, Section, SelectField, TextField } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { nextStep } from '../../domain/entry-draft';
import type { AttributeValue, EntryDraft } from '../../domain/entry-draft.types';
import { useProductEntryModule } from '../../module';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { AttributeField } from './AttributeField';
import { SimilarItem } from './SimilarItem';
import { useBrands } from '../hooks/use-brands';
import { useProductType } from '../hooks/use-product-type';
import { useProductTypes } from '../hooks/use-product-types';
import { useTitleCheck } from '../hooks/use-title-check';
import { useDebounced } from '../hooks/use-debounced';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';
import type { Save } from './NewItemDetails.types';
import { BRAND_NONE, BRAND_UNKNOWN } from './NewItemDetails.constants';
import { schema } from './NewItemDetails.schema';

export function NewItemDetails({ draft, save }: { draft: EntryDraft; save: Save }) {
  const t = useEntryTranslations();

  const go = useEntryNav();
  const { drafts } = useProductEntryModule();
  const { startFromCatalog } = useStartEntry();
  const item = draft.newItem!;
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: schema(t, validationRules),
    defaultValues: {
      title: item.title,
      productTypeId: item.productTypeId,
      brand:
        item.brandStatus === 'Known' && item.brandId
          ? item.brandId
          : item.brandStatus === 'None'
            ? BRAND_NONE
            : item.productTypeId
              ? BRAND_UNKNOWN
              : '',
      baseUnitId: item.baseUnitId,
      barcode: item.baseBarcode,
    },
  });
  const [attrs, setAttrs] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      item.attributes.map((a) => [
        a.attributeId,
        a.optionIds?.[0] ?? a.text ?? a.number ?? (a.bool === undefined ? '' : String(a.bool)),
      ]),
    ),
  );
  const [attrErrors, setAttrErrors] = useState<Record<string, boolean>>({});
  const [more, setMore] = useState(false);

  const typeId = form.watch('productTypeId');
  const types = useProductTypes();
  const type = useProductType(typeId);
  const brands = useBrands();
  const title = useDebounced(form.watch('title'), 500);
  const check = useTitleCheck(title);

  // the type's default base unit is the suggestion until the seller picks another one
  const defaultUnitId = type.data?.defaultBaseUnit.id;
  useEffect(() => {
    if (defaultUnitId && !form.getValues().baseUnitId) form.setValue('baseUnitId', defaultUnitId);
  }, [defaultUnitId, form]);

  const attributes = type.data?.attributes ?? [];
  const shown = attributes.filter((a) => a.isRequired || more);
  const unit = type.data?.allowedUnits.find((u) => u.id === form.watch('baseUnitId'));

  const submit = form.handleSubmit(async (v) => {
    const missingAttrs = attributes.filter((a) => a.isRequired && !attrs[a.attributeId]);
    if (missingAttrs.length) {
      setAttrErrors(Object.fromEntries(missingAttrs.map((a) => [a.attributeId, true])));
      return;
    }
    if (check.data && !check.data.isAvailable) {
      form.setFieldError('title', t('duplicateTitleHint'));
      return;
    }
    const productType = type.data!;
    const u = productType.allowedUnits.find((x) => x.id === v.baseUnitId) ?? productType.defaultBaseUnit;
    const brand = brands.data?.find((b) => b.id === v.brand);
    const values: AttributeValue[] = attributes
      .filter((a) => attrs[a.attributeId])
      .map((a) => toAttributeValue(a, attrs[a.attributeId]!));
    const d = await save((x) => ({
      ...x,
      newItem: {
        title: v.title,
        productTypeId: productType.id,
        productTypeName: productType.name,
        brandStatus: brand ? 'Known' : v.brand === BRAND_NONE ? 'None' : 'Unknown',
        brandId: brand?.id ?? null,
        brandName: brand?.name ?? null,
        baseUnitId: u.id,
        baseUnitName: u.name,
        baseUnitMaxDecimals: u.maxDecimals,
        baseBarcode: v.barcode ?? '',
        attributes: values,
        // first visit: suggest the type's default packagings on the units step
        packagings:
          x.newItem?.productTypeId === productType.id && x.newItem.packagings.length
            ? x.newItem.packagings
            : productType.defaultPackagings.map((p) => ({ name: p.name, baseQty: decimal.of(p.baseQty) })),
      },
    }));
    if (d) go.step(d.id, nextStep(d, 'details'));
  });

  const similar = check.data?.similarItems ?? [];
  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        title={t('newProduct')}
        actions={
          <>
            <Button type="submit" block loading={form.formState.isSubmitting}>
              {t('reviewContinue')}
            </Button>
            <BackButton onClick={go.back} />
          </>
        }
      >
        <Section title={t('mainDetails')}>
          <form.Field name="title">
            {(f) => (
              <TextField
                {...f}
                label={t('distinctName')}
                required
                maxLength={160}
                placeholder={t('nameExample')}
              />
            )}
          </form.Field>
          {similar.length > 0 ? (
            <Alert
              tone={check.data?.isAvailable ? 'warning' : 'danger'}
              title={check.data?.isAvailable ? t('similarCatalog') : t('titleExists')}
              description={
                <div className="flex flex-col gap-2">
                  <span>{t('selectExistingHint')}</span>
                  {similar.slice(0, 3).map((it) => (
                    <SimilarItem
                      key={it.id}
                      item={it}
                      onPick={async () => {
                        await startFromCatalog(it.id, it.myStoreProductId ?? null);
                        await drafts.remove(go.storeId, draft.id);
                      }}
                    />
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
                placeholder={types.isPending ? t('loading') : t('chooseType')}
                options={(types.data ?? []).map((t) => ({
                  value: t.id,
                  label: t.name,
                  description: t.categoryName,
                }))}
                onChange={(v) => {
                  f.onChange(v);
                  form.setValue('baseUnitId', '');
                  if (!form.getValues().brand) form.setValue('brand', BRAND_UNKNOWN);
                  setAttrs({});
                }}
              />
            )}
          </form.Field>
          <form.Field name="brand">
            {(f) => (
              <SelectField
                {...f}
                label={t('brand')}
                required
                searchable
                options={[
                  { value: BRAND_UNKNOWN, label: t('unknown'), description: t('unknownBrand') },
                  { value: BRAND_NONE, label: t('unbranded'), description: t('unbrandedHint') },
                  ...(brands.data ?? []).map((b) => ({
                    value: b.id,
                    label: b.name,
                    description: b.nameEn ?? undefined,
                  })),
                ]}
              />
            )}
          </form.Field>
          <form.Field name="baseUnitId">
            {(f) => (
              <SelectField
                {...f}
                label={t('baseSalesUnit')}
                required
                disabled={!type.data}
                placeholder={typeId ? t('chooseUnit') : t('chooseTypeFirst')}
                options={(type.data?.allowedUnits ?? []).map((u) => ({
                  value: u.id,
                  label: `${u.name}${u.id === type.data?.defaultBaseUnit.id ? t('suggestedType') : ''}`,
                }))}
                hint={unit && unit.maxDecimals > 0 ? t('decimalUnitHint') : undefined}
              />
            )}
          </form.Field>
          {shown.map((a) => (
            <AttributeField
              key={a.attributeId}
              attribute={a}
              value={attrs[a.attributeId] ?? ''}
              error={attrErrors[a.attributeId] ? t('chooseAttribute', { name: a.name }) : undefined}
              onChange={(v) => {
                setAttrs((x) => ({ ...x, [a.attributeId]: v }));
                setAttrErrors((x) => ({ ...x, [a.attributeId]: false }));
              }}
            />
          ))}
          {attributes.some((a) => !a.isRequired) ? (
            <Button type="button" variant="secondary" block onClick={() => setMore((m) => !m)}>
              {more ? t('hideOptional') : t('showOptional')}
            </Button>
          ) : null}
        </Section>
        <Section title={t('barcode')}>
          <form.Field name="barcode">
            {(f) => <BarcodeField {...f} label={t('manufacturerBarcode')} optional />}
          </form.Field>
          <ListRow>{t('hasBarcode')}</ListRow>
          <ListRow>{t('internalBarcodeHint')}</ListRow>
        </Section>
        <Section title={t('publication')}>
          <ListRow>{t('privateImmediately')}</ListRow>
          <ListRow>{t('adminApproval')}</ListRow>
        </Section>
      </EntryShell>
    </form>
  );
}

const toAttributeValue = (a: Dto<'ProductTypeAttributeDto'>, raw: string): AttributeValue => {
  if (a.dataType === 'Option' || a.dataType === 'MultiOption')
    return { attributeId: a.attributeId, optionIds: [raw] };
  if (a.dataType === 'Number') return { attributeId: a.attributeId, number: decimal.of(raw) };
  if (a.dataType === 'Bool') return { attributeId: a.attributeId, bool: raw === 'true' };
  return { attributeId: a.attributeId, text: raw.trim() };
};
