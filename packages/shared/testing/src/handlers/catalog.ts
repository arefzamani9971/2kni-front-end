import type { Dto } from '@dukani/contracts';
import { normalizeTitle, parseBarcode } from '@dukani/domain';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db';
import {
  categories,
  categoriesByStoreType,
  categoryById,
  productTypeAttributes,
  units,
  unitById,
  type CatalogItemRecord,
  type CategoryRecord,
} from '../db/reference';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { page, toCatalogItemDto, toCatalogSummary, toProductTypeSummary } from './dto';

const visibleItems = (db: MockDb, storeId: string) =>
  db.catalogItems().filter((i) => i.status !== 'Archived' && (i.ownerStoreId === null || i.ownerStoreId === storeId));

const storeCategoryIds = (db: MockDb, storeId: string) => {
  const store = db.state.stores.find((s) => s.id === storeId);
  return (store && categoriesByStoreType.get(store.storeTypeId)) ?? new Set(categories.map((c) => c.id));
};

/** Items whose normalized titles share words with the query (similar-title hint of F10). */
export const similarItems = (db: MockDb, storeId: string, title: string, excludeId?: string | null) => {
  const words = normalizeTitle(title).split(' ').filter((w) => w.length > 1);
  return visibleItems(db, storeId)
    .filter((i) => i.id !== excludeId)
    .map((i) => ({ i, score: words.filter((w) => i.normalizedTitle.includes(w)).length }))
    .filter((x) => x.score >= Math.max(1, Math.ceil(words.length / 2)))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => toCatalogSummary(db, x.i, storeId));
};

export const titleCheck = (db: MockDb, storeId: string, title: string, excludeId?: string | null): Dto<'TitleCheckDto'> => {
  const normalized = normalizeTitle(title);
  const taken = visibleItems(db, storeId).some((i) => i.id !== excludeId && i.normalizedTitle === normalized);
  return { normalizedTitle: normalized, isAvailable: !!normalized && !taken, similarItems: similarItems(db, storeId, title, excludeId) };
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
  const title = req.title?.trim() ?? '';
  if (!title) throw fail.validation(f('title'), 'عنوان کالا را وارد کنید.', 'TITLE_REQUIRED');
  const type = db.productTypes().find((t) => t.id === req.productTypeId);
  if (!type) throw fail.validation(f('productTypeId'), 'نوع کالا پیدا نشد یا بایگانی شده است.', 'PRODUCT_TYPE_UNAVAILABLE');
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
  if (req.brandStatus === 'Known' && !req.brandId) throw fail.validation(f('brandId'), 'برند را انتخاب کنید یا «نامعلوم» بزنید.', 'BRAND_REQUIRED');
  const required = productTypeAttributes(type.key).filter((a) => a.isRequired);
  const given = new Set((req.attributes ?? []).map((a) => a.attributeId));
  if (required.some((a) => !given.has(a.attributeId)))
    throw fail.validation(f('attributes'), 'ویژگی‌های الزامی این نوع کالا کامل نیست.', 'REQUIRED_ATTRIBUTE_MISSING');

  const usedCodes = new Set(db.catalogItems().flatMap((i) => i.units.flatMap((u) => u.barcodes.map((b) => b.code))));
  const checkBarcode = (field: string, raw?: string | null) => {
    if (!raw?.trim()) return null;
    const parsed = parseBarcode(raw);
    if (!parsed.ok) throw fail.validation(f(field), 'بارکد معتبر نیست.', 'BARCODE_INVALID');
    if (usedCodes.has(parsed.value)) throw fail.validation(f(field), `بارکد ${parsed.value} قبلاً برای کالای دیگری ثبت شده است.`, 'BARCODE_DUPLICATE');
    usedCodes.add(parsed.value);
    return parsed.value as string;
  };
  const barcode = (code: string | null) => (code ? [{ id: randomId(), code, kind: 'Manufacturer' as const, isSample: false }] : []);
  const baseCode = checkBarcode('baseBarcode', req.baseBarcode);
  const packs = (req.packagings ?? []).map((p, n) => {
    if (!p.name?.trim()) throw fail.validation(f(`packagings[${n}].name`), 'نام بسته‌بندی را وارد کنید.');
    if (!(p.baseQty > 0)) throw fail.validation(f(`packagings[${n}].baseQty`), 'تعداد داخل بسته نامعتبر است.', 'QUANTITY_INVALID');
    return {
      id: randomId(),
      name: p.name.trim(),
      kind: 'Package' as const,
      baseQty: p.baseQty,
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
      if (v.optionIds?.length) return a.options.filter((o) => v.optionIds!.includes(o.id)).map((o) => o.value).join('، ');
      return v.text ?? (v.number !== undefined && v.number !== null ? String(v.number) : null);
    })
    .filter(Boolean)
    .join('، ');
  const item: CatalogItemRecord = {
    id: randomId(),
    title,
    normalizedTitle: normalizeTitle(title),
    productTypeId: type.id,
    brandId: req.brandStatus === 'Known' ? (req.brandId ?? null) : null,
    brandStatus: req.brandStatus,
    baseUnitId: base.id,
    netContentValue: req.netContentValue ?? null,
    netContentUnitId: req.netContentUnitId ?? null,
    units: [
      { id: randomId(), name: base.name, kind: 'Base', baseQty: 1, isSellable: true, isPurchasable: true, barcodes: barcode(baseCode) },
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

const tree = (db: MockDb, storeId: string, visible: Set<string>): Dto<'CategoryNodeDto'>[] => {
  const types = db.productTypes();
  const node = (c: CategoryRecord): Dto<'CategoryNodeDto'> => {
    const children = categories.filter((x) => x.parentId === c.id && visible.has(x.id)).sort((a, b) => a.sort - b.sort).map(node);
    const own = types.filter((t) => t.categoryId === c.id && (t.ownerStoreId === null || t.ownerStoreId === storeId));
    return {
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      sort: c.sort,
      status: 'Public',
      productTypeCount: own.length + children.reduce((s, x) => s + x.productTypeCount, 0),
      productCount: 0,
      children,
    };
  };
  return categories.filter((c) => c.parentId === null && visible.has(c.id)).sort((a, b) => a.sort - b.sort).map(node);
};

/** Catalog module (store side): barcode lookup, item search/create, title check, types, categories, brands, units. */
export const catalogHandlers = (db: MockDb) => [
  route.get('/api/v1/stores/{storeId}/barcodes/{code}', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    const parsed = parseBarcode(decodeURIComponent(params.code));
    if (!parsed.ok) return { code: params.code, kind: 'Invalid' as const, matches: [], message: parsed.error.message };
    const code = parsed.value as string;
    const matches: Dto<'BarcodeMatchDto'>[] = [];
    for (const item of visibleItems(db, params.storeId)) {
      for (const unit of item.units) {
        if (!unit.barcodes.some((b) => b.code === code)) continue;
        const sp = db.state.storeProducts.find((p) => p.storeId === params.storeId && p.catalogItemId === item.id && p.status === 'Active');
        const spu = sp?.units.find((u) => u.catalogItemUnitId === unit.id);
        matches.push({
          catalogItemId: item.id,
          catalogItemUnitId: unit.id,
          title: sp?.localTitle ?? item.title,
          unitName: unit.name,
          baseQty: unit.baseQty,
          storeProductId: sp?.id ?? null,
          storeProductUnitId: spu?.id ?? null,
          available: sp ? sp.onHand - sp.reserved : null,
          unitPriceRials: spu?.salePrice ?? (sp?.baseSalePrice != null ? sp.baseSalePrice * unit.baseQty : null),
          catalogStatus: item.status,
        });
      }
    }
    const kind: Dto<'BarcodeLookupKind'> =
      matches.length === 0 ? 'Unknown' : matches.length > 1 ? 'Multiple' : matches[0]!.storeProductId ? 'StoreProduct' : 'GlobalCatalog';
    return { code, kind, matches, message: null };
  }),

  route.get('/api/v1/stores/{storeId}/catalog/items', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    const q = normalizeTitle(query.get('q') ?? '');
    const barcode = query.get('barcode');
    const typeId = query.get('productTypeId');
    const brandId = query.get('brandId');
    const notMine = query.get('onlyNotInMyStore') === 'true';
    const mine = new Set(db.state.storeProducts.filter((p) => p.storeId === params.storeId).map((p) => p.catalogItemId));
    const items = visibleItems(db, params.storeId).filter(
      (i) =>
        (!q || q.split(' ').every((w) => i.normalizedTitle.includes(w))) &&
        (!barcode || i.units.some((u) => u.barcodes.some((b) => b.code === barcode))) &&
        (!typeId || i.productTypeId === typeId) &&
        (!brandId || i.brandId === brandId) &&
        (!notMine || !mine.has(i.id)),
    );
    const p = page(items, query);
    return { ...p, items: p.items.map((i) => toCatalogSummary(db, i, params.storeId)) };
  }),

  route.post('/api/v1/stores/{storeId}/catalog/items', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    return db.mutate(() => toCatalogItemDto(db, createCatalogItem(db, params.storeId, body), params.storeId));
  }),

  route.get('/api/v1/stores/{storeId}/catalog/items/title-check', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    return titleCheck(db, params.storeId, query.get('title') ?? '', query.get('excludeItemId'));
  }),

  route.get('/api/v1/stores/{storeId}/catalog/items/{itemId}', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    const item = visibleItems(db, params.storeId).find((i) => i.id === params.itemId);
    if (!item) throw fail.notFound('کالای کاتالوگ');
    return toCatalogItemDto(db, item, params.storeId);
  }),

  route.get('/api/v1/stores/{storeId}/catalog/product-types', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    const visible = storeCategoryIds(db, params.storeId);
    const categoryId = query.get('categoryId');
    const q = normalizeTitle(query.get('q') ?? '');
    return db
      .productTypes()
      .filter(
        (t) =>
          (t.ownerStoreId === null || t.ownerStoreId === params.storeId) &&
          visible.has(t.categoryId) &&
          (!categoryId || t.categoryId === categoryId || categoryById(t.categoryId)?.parentId === categoryId) &&
          (!q || normalizeTitle(t.name).includes(q)),
      )
      .map((t) => toProductTypeSummary(db, t.id));
  }),

  route.get('/api/v1/stores/{storeId}/catalog/product-types/{productTypeId}', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    const t = db.productTypes().find((x) => x.id === params.productTypeId);
    if (!t) throw fail.notFound('نوع کالا');
    const summary = toProductTypeSummary(db, t.id);
    const base = unitById(t.defaultBaseUnitId)!;
    return {
      ...summary,
      defaultBaseUnit: base,
      allowedUnits: units.filter((u) => u.dimension === t.measureDimension),
      allowDecimalQuantity: base.maxDecimals > 0,
      defaultPackagings: t.defaultPackagings,
      schemaVersion: 1,
      attributes: productTypeAttributes(t.key),
    };
  }),

  route.post('/api/v1/stores/{storeId}/catalog/product-types', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const name = body.name?.trim();
    if (!name) throw fail.validation('name', 'نام نوع کالا را وارد کنید.', 'TYPE_NAME_REQUIRED');
    if (db.productTypes().some((t) => normalizeTitle(t.name) === normalizeTitle(name) && (t.ownerStoreId ?? params.storeId) === params.storeId))
      throw fail.conflict('PRODUCT_TYPE_DUPLICATE', 'نوع کالایی با همین نام هست.');
    const base = unitById(body.defaultBaseUnitId);
    if (!base) throw fail.validation('defaultBaseUnitId', 'واحد پایه پیدا نشد.', 'UNIT_UNAVAILABLE');
    return db.mutate((s) => {
      const t = {
        id: randomId(),
        key: `store.${randomId()}`,
        categoryId: body.categoryId,
        name,
        measureDimension: base.dimension,
        defaultBaseUnitId: base.id,
        defaultPackagings: (body.defaultPackagings ?? []).map((p) => ({ name: p.name, baseQty: p.baseQty })),
        ownerStoreId: params.storeId,
      };
      s.productTypes.push(t);
      const summary = toProductTypeSummary(db, t.id);
      return {
        ...summary,
        defaultBaseUnit: base,
        allowedUnits: units.filter((u) => u.dimension === base.dimension),
        allowDecimalQuantity: base.maxDecimals > 0,
        defaultPackagings: t.defaultPackagings,
        schemaVersion: 1,
        attributes: [],
      };
    });
  }),

  route.get('/api/v1/stores/{storeId}/catalog/categories', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    return tree(db, params.storeId, storeCategoryIds(db, params.storeId));
  }),

  route.get('/api/v1/stores/{storeId}/catalog/brands', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    const store = db.state.stores.find((s) => s.id === params.storeId);
    const q = normalizeTitle(query.get('q') ?? '');
    return db
      .brands()
      .filter(
        (b) =>
          (b.storeTypeId === null || b.storeTypeId === store?.storeTypeId) &&
          (!q || normalizeTitle(b.name).includes(q) || (b.nameEn ?? '').toLowerCase().includes(q)),
      )
      .map(({ storeTypeId: _, ...b }) => b);
  }),

  route.post('/api/v1/stores/{storeId}/catalog/brands', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const name = body.name?.trim();
    if (!name) throw fail.validation('name', 'نام برند را وارد کنید.');
    if (db.brands().some((b) => normalizeTitle(b.name) === normalizeTitle(name)))
      throw fail.conflict('BRAND_DUPLICATE', 'برندی با همین نام هست؛ همان را انتخاب کنید.');
    return db.mutate((s) => {
      const store = s.stores.find((x) => x.id === params.storeId);
      const b = { id: randomId(), name, nameEn: body.nameEn?.trim() || null, status: 'Private' as const, storeTypeId: store?.storeTypeId ?? null };
      s.brands.push(b);
      const { storeTypeId: _, ...dto } = b;
      return dto;
    });
  }),

  route.get('/api/v1/units', () => units),
];
