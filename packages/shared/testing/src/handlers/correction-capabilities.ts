import type { Dto } from '@dukani/contracts';
import type { MockDb } from '../db/mock-db.types';
import { productTypeAttributes, units } from '../db/reference';
import { fail } from '../msw/problem';
import { toCatalogItemDto } from './dto';

type Capability = Dto<'CorrectionCapabilityDto'>;

const valueType = (t: Dto<'AttributeDataType'>): Dto<'CorrectionValueType'> =>
  t === 'MultiOption'
    ? 'MultiOption'
    : t === 'Option'
      ? 'Option'
      : t === 'Number'
        ? 'Number'
        : t === 'Bool'
          ? 'Bool'
          : 'Text';

/** Mirror of backend `CorrectionCapabilities.For`: fixed fields plus the type's attributes, no identity fields (F11 §4). */
export const correctionCapabilities = (db: MockDb, storeId: string, itemId: string) => {
  const entity = db
    .catalogItems()
    .find((i) => i.id === itemId && (i.ownerStoreId === null || i.ownerStoreId === storeId));
  if (!entity) throw fail.notFound('کالای کاتالوگ');
  if (entity.ownerStoreId === storeId)
    throw fail.rule('CATALOG_ITEM_NOT_EDITABLE', 'کالای خصوصی فروشگاه را مستقیم ویرایش کنید.');
  const item = toCatalogItemDto(db, entity, storeId);
  if (item.status === 'Archived') throw fail.rule('CATALOG_ITEM_ARCHIVED', 'این کالا بایگانی شده است.');
  const typeKey = db.productTypes().find((t) => t.id === item.productType.id)?.key;
  const fields: Capability[] = [
    {
      key: 'title',
      valueType: 'Text',
      name: null,
      currentValue: item.title,
      currentName: null,
      clearable: false,
      maxLength: 250,
      allowedValues: [],
    },
    {
      key: 'description',
      valueType: 'LongText',
      name: null,
      currentValue: item.description ?? null,
      currentName: null,
      clearable: true,
      maxLength: 2000,
      allowedValues: [],
    },
    {
      key: 'brandId',
      valueType: 'Brand',
      name: null,
      currentValue: item.brand?.id ?? null,
      currentName: item.brand?.name ?? null,
      clearable: true,
      maxLength: null,
      allowedValues: [],
    },
    {
      key: 'netContentValue',
      valueType: 'Number',
      name: null,
      currentValue: item.netContentValue ?? null,
      currentName: null,
      clearable: true,
      maxLength: null,
      allowedValues: [],
    },
    {
      key: 'netContentUnitId',
      valueType: 'Unit',
      name: null,
      currentValue: item.netContentUnit?.id ?? null,
      currentName: item.netContentUnit?.name ?? null,
      clearable: true,
      maxLength: null,
      allowedValues: units.filter((u) => u.dimension !== 'Count').map((u) => ({ value: u.id, name: u.name })),
    },
  ];
  for (const a of typeKey ? productTypeAttributes(typeKey) : []) {
    const value = item.attributes.find((v) => v.key === a.key);
    fields.push({
      key: `attr:${a.key}`,
      valueType: valueType(a.dataType),
      name: a.name,
      currentValue: value
        ? value.options.length
          ? value.options.map((o) => o.key).join(',')
          : (value.text ?? value.number ?? (value.bool == null ? null : String(value.bool)))
        : null,
      currentName: value?.options.length ? value.options.map((o) => o.value).join('، ') : null,
      clearable: !a.isRequired,
      maxLength: a.dataType === 'Text' ? 250 : null,
      allowedValues: a.options.filter((o) => !o.isArchived).map((o) => ({ value: o.key, name: o.value })),
    });
  }
  return { item, fields };
};

/** Keys outside the capabilities, unchanged values and empty required values are rejected like the backend. */
export const normalizeProposal = (
  fields: Capability[],
  proposed: Record<string, string | null | undefined>,
) => {
  const result: Record<string, string | null> = {};
  for (const [rawKey, raw] of Object.entries(proposed)) {
    const key = rawKey.trim();
    const field = fields.find((f) => f.key === key);
    if (!field)
      throw fail.validation(
        `proposedChanges.${key}`,
        'این فیلد در پیشنهاد اصلاح قابل تغییر نیست.',
        'CHANGE_KEY_UNSUPPORTED',
      );
    const value = raw?.trim() ? raw.trim() : null;
    if (value === null && !field.clearable)
      throw fail.validation(`proposedChanges.${key}`, 'این فیلد را نمی‌توان خالی کرد.');
    if (value !== null && field.maxLength != null && value.length > field.maxLength)
      throw fail.validation(`proposedChanges.${key}`, `حداکثر ${field.maxLength} حرف مجاز است.`);
    if (
      value !== null &&
      field.allowedValues.length &&
      value.split(',').some((k) => !field.allowedValues.some((o) => o.value === k.trim()))
    )
      throw fail.validation(`proposedChanges.${key}`, 'گزینهٔ انتخاب‌شده معتبر نیست.');
    if (value === (field.currentValue ?? null))
      throw fail.validation(`proposedChanges.${key}`, 'مقدار پیشنهادی با مقدار فعلی یکی است.');
    result[key] = value;
  }
  return result;
};
