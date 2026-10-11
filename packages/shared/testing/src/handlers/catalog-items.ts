import type { Dto } from '@dukani/contracts';
import { normalizeTitle, parseBarcode } from '@dukani/domain';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db.types';
import { categories, categoriesByStoreType } from '../db/reference.constants';
import { productTypeAttributes, unitById } from '../db/reference';
import type { CatalogItemRecord, CategoryRecord } from '../db/reference.types';
import { fail } from '../msw/problem';
import { toCatalogSummary } from './dto';
import { num, num0 } from '../db/wire';

/** Store-visible catalog: items, title similarity, item creation and the category tree (mirrors backend catalog queries). */
export const visibleItems = (db: MockDb, storeId: string) =>
  db
    .catalogItems()
    .filter((i) => i.status !== 'Archived' && (i.ownerStoreId === null || i.ownerStoreId === storeId));

export const storeCategoryIds = (db: MockDb, storeId: string) => {
  const store = db.state.stores.find((s) => s.id === storeId);
  const visible = new Set(
    (store && categoriesByStoreType.get(store.storeTypeId)) ?? categories.map((c) => c.id),
  );
  for (const category of db.categories()) {
    if (category.ownerStoreId === storeId && category.status !== 'Archived') visible.add(category.id);
  }
  return visible;
};

/** Items whose normalized titles share words with the query (similar-title hint of F10). */
export const similarItems = (db: MockDb, storeId: string, title: string, excludeId?: string | null) => {
  const words = normalizeTitle(title)
    .split(' ')
    .filter((w) => w.length > 1);
  return visibleItems(db, storeId)
    .filter((i) => i.id !== excludeId)
    .map((i) => ({ i, score: words.filter((w) => i.normalizedTitle.includes(w)).length }))
    .filter((x) => x.score >= Math.max(1, Math.ceil(words.length / 2)))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => toCatalogSummary(db, x.i, storeId));
};

export const titleCheck = (
  db: MockDb,
  storeId: string,
  title: string,
  excludeId?: string | null,
): Dto<'TitleCheckDto'> => {
  const normalized = normalizeTitle(title);
  const taken = visibleItems(db, storeId).some((i) => i.id !== excludeId && i.normalizedTitle === normalized);
  return {
    normalizedTitle: normalized,
    isAvailable: !!normalized && !taken,
    similarItems: similarItems(db, storeId, title, excludeId),
  };
};

/** Validates and creates a store-private catalog item (same rules as `ProductRegistrationEngine.PlanRow`). */
export const createCatalogItem = (
  db: MockDb,
  storeId: string,
  req: Dto<'CreateCatalogItemRequest'>,
  fieldPrefix = '',
  opts: { dryRun?: boolean; allowDuplicateTitle?: boolean } = {},
): CatalogItemRecord => {
  const f = (name: string) => `${fieldPrefix}${name}`;
  if (req.kind === 'Service' && (req.baseBarcode || req.packagings?.length))
    throw fail.rule('SERVICE_NOT_STOCKABLE', 'خدمت بارکد یا بسته‌بندی ندارد.');
  const title = req.title?.trim() ?? '';
  if (!title) throw fail.validation(f('title'), 'عنوان کالا را وارد کنید.', 'TITLE_REQUIRED');
  const type = db.productTypes().find((t) => t.id === req.productTypeId);
  if (!type)
    throw fail.validation(
      f('productTypeId'),
      'نوع کالا پیدا نشد یا بایگانی شده است.',
      'PRODUCT_TYPE_UNAVAILABLE',
    );
  const base = unitById(req.baseUnitId);
  if (!base) throw fail.validation(f('baseUnitId'), 'واحد پایه پیدا نشد.', 'UNIT_UNAVAILABLE');
  if (base.dimension !== type.measureDimension)
    throw fail.validation(f('baseUnitId'), 'واحد پایه با نوع کالا هم‌خوان نیست.', 'UNIT_DIMENSION_MISMATCH');
  if (!opts.allowDuplicateTitle && !titleCheck(db, storeId, title).isAvailable)
    throw fail.validation(
      f('title'),
      `کالایی با عنوان «${title}» در کاتالوگ هست؛ همان را انتخاب کنید یا تمایز واقعی (مدل، رنگ، بسته) اضافه کنید.`,
      'TITLE_DUPLICATE',
    );
  if (req.brandStatus === 'Known' && !req.brandId)
    throw fail.validation(f('brandId'), 'برند را انتخاب کنید یا «نامعلوم» بزنید.', 'BRAND_REQUIRED');
  const required = productTypeAttributes(type.key).filter((a) => a.isRequired);
  const given = new Set((req.attributes ?? []).map((a) => a.attributeId));
  if (required.some((a) => !given.has(a.attributeId)))
    throw fail.validation(
      f('attributes'),
      'ویژگی‌های الزامی این نوع کالا کامل نیست.',
      'REQUIRED_ATTRIBUTE_MISSING',
    );

  const usedCodes = new Set(
    db.catalogItems().flatMap((i) => i.units.flatMap((u) => u.barcodes.map((b) => b.code))),
  );
  const checkBarcode = (field: string, raw?: string | null) => {
    if (!raw?.trim()) return null;
    const parsed = parseBarcode(raw);
    if (!parsed.ok) throw fail.validation(f(field), 'بارکد معتبر نیست.', 'BARCODE_INVALID');
    if (usedCodes.has(parsed.value))
      throw fail.validation(
        f(field),
        `بارکد ${parsed.value} قبلاً برای کالای دیگری ثبت شده است.`,
        'BARCODE_DUPLICATE',
      );
    usedCodes.add(parsed.value);
    return parsed.value as string;
  };
  const barcode = (code: string | null) =>
    code ? [{ id: randomId(), code, kind: 'Manufacturer' as const, isSample: false }] : [];
  const baseCode = checkBarcode('baseBarcode', req.baseBarcode);
  const packs = (req.packagings ?? []).map((p, n) => {
    if (!p.name?.trim()) throw fail.validation(f(`packagings[${n}].name`), 'نام بسته‌بندی را وارد کنید.');
    if (!(num0(p.baseQty) > 0))
      throw fail.validation(
        f(`packagings[${n}].baseQty`),
        'تعداد داخل بسته نامعتبر است.',
        'QUANTITY_INVALID',
      );
    return {
      id: randomId(),
      name: p.name.trim(),
      kind: 'Package' as const,
      baseQty: num0(p.baseQty),
      isSellable: p.isSellable ?? true,
      isPurchasable: p.isPurchasable ?? true,
      barcodes: barcode(checkBarcode(`packagings[${n}].barcode`, p.barcode)),
    };
  });
  const attrs = productTypeAttributes(type.key);
  const keyAttributes = (req.attributes ?? [])
    .map((v) => {
      const a = attrs.find((x) => x.attributeId === v.attributeId);
      if (!a) return null;
      if (v.optionIds?.length)
        return a.options
          .filter((o) => v.optionIds!.includes(o.id))
          .map((o) => o.value)
          .join('، ');
      return v.text ?? (v.number !== undefined && v.number !== null ? String(v.number) : null);
    })
    .filter(Boolean)
    .join('، ');
  const item: CatalogItemRecord = {
    kind: req.kind ?? 'Goods',
    id: randomId(),
    title,
    normalizedTitle: normalizeTitle(title),
    productTypeId: type.id,
    brandId: req.brandStatus === 'Known' ? (req.brandId ?? null) : null,
    brandStatus: req.brandStatus,
    baseUnitId: base.id,
    netContentValue: num(req.netContentValue),
    netContentUnitId: req.netContentUnitId ?? null,
    units: [
      {
        id: randomId(),
        name: base.name,
        kind: 'Base',
        baseQty: 1,
        isSellable: true,
        isPurchasable: true,
        barcodes: barcode(baseCode),
      },
      ...packs,
    ],
    imageFileIds: req.imageFileIds ?? [],
    description: req.description?.trim() || null,
    status: req.submitForPublicReview ? 'PendingReview' : 'Private',
    origin: 'Store',
    ownerStoreId: storeId,
    keyAttributes: keyAttributes || null,
  };
  if (!opts.dryRun) db.state.catalogItems.push(item);
  return item;
};

export const tree = (db: MockDb, storeId: string, visible: Set<string>): Dto<'CategoryNodeDto'>[] => {
  const types = db.productTypes();
  const node = (c: CategoryRecord): Dto<'CategoryNodeDto'> => {
    const children = db
      .categories()
      .filter((x) => x.parentId === c.id && visible.has(x.id))
      .sort((a, b) => a.sort - b.sort)
      .map(node);
    const own = types.filter(
      (t) => t.categoryId === c.id && (t.ownerStoreId === null || t.ownerStoreId === storeId),
    );
    return {
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      sort: c.sort,
      status: c.status ?? 'Public',
      productTypeCount: own.length + children.reduce((s, x) => s + x.productTypeCount, 0),
      productCount: 0,
      children,
    };
  };
  return db
    .categories()
    .filter((c) => c.parentId === null && visible.has(c.id))
    .sort((a, b) => a.sort - b.sort)
    .map(node);
};
