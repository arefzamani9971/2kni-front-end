'use client';
import type { Dto } from '@dukani/contracts';
import { decimal } from '@dukani/domain';
import { rules, s, useAppForm } from '@dukani/forms';
import { Alert, BarcodeField, Button, ListRow, Section, SelectField, TextField } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { nextStep, type AttributeValue, type EntryDraft } from '../../domain/entry-draft';
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

type Save = (update: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;

const schema = s.object({
  title: rules.requiredText('نام کامل کالا', 160),
  productTypeId: rules.required('نوع کالا'),
  brand: rules.required('برند'),
  baseUnitId: rules.required('واحد پایهٔ فروش'),
  barcode: rules.optional.barcode(),
});

const BRAND_UNKNOWN = 'unknown';
const BRAND_NONE = 'none';

export function NewItemDetails({ draft, save }: { draft: EntryDraft; save: Save }) {
  const go = useEntryNav();
  const { drafts } = useProductEntryModule();
  const { startFromCatalog } = useStartEntry();
  const item = draft.newItem!;
  const form = useAppForm({
    schema,
    defaultValues: {
      title: item.title,
      productTypeId: item.productTypeId,
      brand: item.brandStatus === 'Known' && item.brandId ? item.brandId : item.brandStatus === 'None' ? BRAND_NONE : item.productTypeId ? BRAND_UNKNOWN : '',
      baseUnitId: item.baseUnitId,
      barcode: item.baseBarcode,
    },
  });
  const [attrs, setAttrs] = useState<Record<string, string>>(() =>
    Object.fromEntries(item.attributes.map((a) => [a.attributeId, a.optionIds?.[0] ?? a.text ?? a.number ?? (a.bool === undefined ? '' : String(a.bool))])),
  );
  const [attrErrors, setAttrErrors] = useState<Record<string, string>>({});
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
      setAttrErrors(Object.fromEntries(missingAttrs.map((a) => [a.attributeId, `${a.name} را انتخاب کنید.`])));
      return;
    }
    if (check.data && !check.data.isAvailable) {
      form.setFieldError('title', 'کالایی با همین عنوان هست؛ همان را انتخاب کنید یا مدل، رنگ یا بسته را در نام بنویسید.');
      return;
    }
    const t = type.data!;
    const u = t.allowedUnits.find((x) => x.id === v.baseUnitId) ?? t.defaultBaseUnit;
    const brand = brands.data?.find((b) => b.id === v.brand);
    const values: AttributeValue[] = attributes
      .filter((a) => attrs[a.attributeId])
      .map((a) => toAttributeValue(a, attrs[a.attributeId]!));
    const d = await save((x) => ({
      ...x,
      newItem: {
        title: v.title,
        productTypeId: t.id,
        productTypeName: t.name,
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
          x.newItem?.productTypeId === t.id && x.newItem.packagings.length
            ? x.newItem.packagings
            : t.defaultPackagings.map((p) => ({ name: p.name, baseQty: decimal.of(p.baseQty) })),
      },
    }));
    if (d) go.step(d.id, nextStep(d, 'details'));
  });

  const similar = check.data?.similarItems ?? [];
  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        title="ثبت کالای جدید"
        actions={
          <>
            <Button type="submit" block loading={form.formState.isSubmitting}>
              بررسی و ادامه
            </Button>
            <BackButton onClick={go.back} />
          </>
        }
      >
        <Section title="مشخصات اصلی">
          <form.Field name="title">{(f) => <TextField {...f} label="نام کامل و متمایز" required maxLength={160} placeholder="مثلاً خودکار بیک آبی مدل A" />}</form.Field>
          {similar.length > 0 ? (
            <Alert
              tone={check.data?.isAvailable ? 'warning' : 'danger'}
              title={check.data?.isAvailable ? 'کالای مشابه در کاتالوگ هست' : 'این عنوان قبلاً ثبت شده'}
              description={
                <div className="flex flex-col gap-2">
                  <span>اگر همین کالاست، آن را انتخاب کنید تا کالای تکراری ساخته نشود.</span>
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
                label="نوع کالا"
                required
                searchable
                placeholder={types.isPending ? 'در حال بارگذاری…' : 'انتخاب نوع'}
                options={(types.data ?? []).map((t) => ({ value: t.id, label: t.name, description: t.categoryName }))}
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
                label="برند"
                required
                searchable
                options={[
                  { value: BRAND_UNKNOWN, label: 'نامعلوم', description: 'برند را نمی‌دانم' },
                  { value: BRAND_NONE, label: 'بدون برند', description: 'کالای فله یا بی‌نام' },
                  ...(brands.data ?? []).map((b) => ({ value: b.id, label: b.name, description: b.nameEn ?? undefined })),
                ]}
              />
            )}
          </form.Field>
          <form.Field name="baseUnitId">
            {(f) => (
              <SelectField
                {...f}
                label="واحد پایهٔ فروش"
                required
                disabled={!type.data}
                placeholder={typeId ? 'انتخاب واحد' : 'اول نوع کالا را انتخاب کنید'}
                options={(type.data?.allowedUnits ?? []).map((u) => ({ value: u.id, label: `${u.name}${u.id === type.data?.defaultBaseUnit.id ? '؛ پیشنهاد نوع کالا' : ''}` }))}
                hint={unit && unit.maxDecimals > 0 ? 'برای کالاهای وزنی، مقدار اعشاری با واحد انتخاب‌شده ثبت می‌شود.' : undefined}
              />
            )}
          </form.Field>
          {shown.map((a) => (
            <AttributeField
              key={a.attributeId}
              attribute={a}
              value={attrs[a.attributeId] ?? ''}
              error={attrErrors[a.attributeId]}
              onChange={(v) => {
                setAttrs((x) => ({ ...x, [a.attributeId]: v }));
                setAttrErrors((x) => ({ ...x, [a.attributeId]: '' }));
              }}
            />
          ))}
          {attributes.some((a) => !a.isRequired) ? (
            <Button type="button" variant="secondary" block onClick={() => setMore((m) => !m)}>
              {more ? 'پنهان کردن مشخصات اختیاری' : 'گزینه‌های برند و مشخصات بیشتر'}
            </Button>
          ) : null}
        </Section>
        <Section title="بارکد">
          <form.Field name="barcode">{(f) => <BarcodeField {...f} label="بارکد سازنده" optional />}</form.Field>
          <ListRow>بارکد معتبر برای همین واحد فروش دارید؟</ListRow>
          <ListRow>اگر ندارید، بارکد داخلی پس از ثبت ایجاد می‌شود.</ListRow>
        </Section>
        <Section title="انتشار">
          <ListRow>کالا بلافاصله فقط برای فروشگاه شما قابل استفاده است.</ListRow>
          <ListRow>عمومی‌شدن نیازمند تأیید ادمین است.</ListRow>
        </Section>
      </EntryShell>
    </form>
  );
}

const toAttributeValue = (a: Dto<'ProductTypeAttributeDto'>, raw: string): AttributeValue => {
  if (a.dataType === 'Option' || a.dataType === 'MultiOption') return { attributeId: a.attributeId, optionIds: [raw] };
  if (a.dataType === 'Number') return { attributeId: a.attributeId, number: decimal.of(raw) };
  if (a.dataType === 'Bool') return { attributeId: a.attributeId, bool: raw === 'true' };
  return { attributeId: a.attributeId, text: raw.trim() };
};
