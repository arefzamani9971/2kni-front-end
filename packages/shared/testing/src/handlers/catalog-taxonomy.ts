import { normalizeTitle } from '@dukani/domain';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db.types';
import { categoryById, productTypeAttributes, units, unitById } from '../db/reference';
import type { CategoryRecord } from '../db/reference.types';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { toProductTypeSummary } from './dto';
import { num0, str } from '../db/wire';
import { storeCategoryIds, tree } from './catalog-items';

/** Catalog taxonomy (store side): product types, categories and brands. */
export const catalogTaxonomyHandlers = (db: MockDb) => [
  route.get('/api/v1/stores/{storeId}/catalog/product-types', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    const visible = storeCategoryIds(db, params.storeId);
    const categoryId = query.get('categoryId');
    const q = normalizeTitle(query.get('q') ?? '');
    return db
      .productTypes()
      .filter(
        (t) =>
          t.status !== 'Archived' &&
          (t.ownerStoreId === null || t.ownerStoreId === params.storeId) &&
          (t.categoryId === null || t.ownerStoreId === params.storeId || visible.has(t.categoryId)) &&
          (!categoryId ||
            t.categoryId === categoryId ||
            categoryById(t.categoryId)?.parentId === categoryId) &&
          (!q || normalizeTitle(t.name).includes(q)),
      )
      .map((t) => toProductTypeSummary(db, t.id));
  }),

  route.get('/api/v1/stores/{storeId}/catalog/product-types/{productTypeId}', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    const t = db
      .productTypes()
      .find(
        (x) =>
          x.id === params.productTypeId && (x.ownerStoreId === null || x.ownerStoreId === params.storeId),
      );
    if (!t) throw fail.notFound('نوع کالا');
    const { itemCount: _count, attributeNames: _names, ...summary } = toProductTypeSummary(db, t.id);
    const base = unitById(t.defaultBaseUnitId)!;
    return {
      ...summary,
      defaultBaseUnit: base,
      allowedUnits: units.filter((u) => u.dimension === t.measureDimension),
      allowDecimalQuantity: base.maxDecimals > 0,
      defaultPackagings: t.defaultPackagings.map((p) => ({ name: p.name, baseQty: str(p.baseQty) })),
      schemaVersion: 1,
      attributes: productTypeAttributes(t.key),
    };
  }),

  route.post('/api/v1/stores/{storeId}/catalog/product-types', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const name = body.name?.trim();
    if (!name || name.length > 120)
      throw fail.validation('name', 'نام نوع کالا باید بین ۱ تا ۱۲۰ نویسه باشد.', 'TYPE_NAME_REQUIRED');
    if (body.categoryId && !storeCategoryIds(db, params.storeId).has(body.categoryId))
      throw fail.notFound('گروه کالا');
    if (
      db
        .productTypes()
        .some(
          (t) =>
            t.categoryId === (body.categoryId ?? null) &&
            normalizeTitle(t.name) === normalizeTitle(name) &&
            (t.ownerStoreId ?? params.storeId) === params.storeId,
        )
    )
      throw fail.conflict('PRODUCT_TYPE_DUPLICATE', 'نوع کالایی با همین نام هست.');
    const base = unitById(body.defaultBaseUnitId);
    if (!base) throw fail.validation('defaultBaseUnitId', 'واحد پایه پیدا نشد.', 'UNIT_UNAVAILABLE');
    return db.mutate((s) => {
      const t = {
        id: randomId(),
        key: `store.${randomId()}`,
        categoryId: body.categoryId ?? null,
        name,
        measureDimension: base.dimension,
        defaultBaseUnitId: base.id,
        defaultPackagings: (body.defaultPackagings ?? []).map((p) => ({
          name: p.name,
          baseQty: num0(p.baseQty),
        })),
        ownerStoreId: params.storeId,
      };
      s.productTypes.push(t);
      const summary = toProductTypeSummary(db, t.id);
      return {
        ...summary,
        defaultBaseUnit: base,
        allowedUnits: units.filter((u) => u.dimension === base.dimension),
        allowDecimalQuantity: base.maxDecimals > 0,
        defaultPackagings: t.defaultPackagings.map((p) => ({ name: p.name, baseQty: str(p.baseQty) })),
        schemaVersion: 1,
        attributes: [],
      };
    });
  }),

  route.post(
    '/api/v1/stores/{storeId}/catalog/product-types/{productTypeId}/submit',
    ({ request, params }) => {
      db.requireMember(request, params.storeId, 'product.manage');
      const type = db
        .productTypes()
        .find((t) => t.id === params.productTypeId && t.ownerStoreId === params.storeId);
      if (!type || type.status === 'Archived') throw fail.notFound('نوع کالا');
      return db.mutate(() => {
        type.status = 'PendingReview';
        const now = new Date().toISOString();
        return {
          id: type.id,
          catalogItemId: null,
          productTypeId: type.id,
          subject: type.name,
          status: 'Submitted' as const,
          proposedChanges: {},
          reason: '',
          evidenceFileIds: [],
          decisionReason: null,
          createdAt: now,
          history: [{ at: now, status: 'Submitted' as const, note: '' }],
        };
      });
    },
  ),

  route.get('/api/v1/stores/{storeId}/catalog/categories', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    return tree(db, params.storeId, storeCategoryIds(db, params.storeId));
  }),

  route.post('/api/v1/stores/{storeId}/catalog/categories', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const name = body.name?.trim() ?? '';
    if (!name || name.length > 120) throw fail.validation('name', 'نام گروه باید بین ۱ تا ۱۲۰ نویسه باشد.');
    const parentId = body.parentId ?? null;
    const visible = storeCategoryIds(db, params.storeId);
    const rows = db.categories();
    let parent = parentId
      ? rows.find((c) => c.id === parentId && visible.has(c.id) && c.status !== 'Archived')
      : undefined;
    if (parentId && !parent) throw fail.notFound('گروه والد');
    let depth = 1;
    const ancestors = new Set<string>();
    while (parent) {
      if (ancestors.has(parent.id) || ++depth > 3)
        throw fail.validation('parentId', 'عمق گروه حداکثر سه سطح است.');
      ancestors.add(parent.id);
      parent = parent.parentId ? rows.find((c) => c.id === parent!.parentId) : undefined;
    }
    if (
      rows.some(
        (c) =>
          visible.has(c.id) &&
          c.status !== 'Archived' &&
          c.parentId === parentId &&
          normalizeTitle(c.name) === normalizeTitle(name),
      )
    )
      throw fail.conflict('CATEGORY_DUPLICATE', 'گروهی با همین نام در این سطح هست.');
    return db.mutate((state) => {
      const category: CategoryRecord = {
        id: randomId(),
        key: 'store.' + randomId(),
        parentId,
        name,
        sort: 0,
        ownerStoreId: params.storeId,
        status: 'Private',
      };
      (state.categories ??= []).push(category);
      return {
        id: category.id,
        name,
        parentId,
        sort: 0,
        status: 'Private' as const,
        productTypeCount: 0,
        productCount: 0,
        children: [],
      };
    });
  }),

  route.get('/api/v1/stores/{storeId}/catalog/brands', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    const store = db.state.stores.find((s) => s.id === params.storeId);
    const q = normalizeTitle(query.get('q') ?? '');
    return db
      .brands()
      .filter(
        (b) =>
          (!b.ownerStoreId || b.ownerStoreId === params.storeId) &&
          (b.storeTypeId === null || b.storeTypeId === store?.storeTypeId) &&
          (!q || normalizeTitle(b.name).includes(q) || (b.nameEn ?? '').toLowerCase().includes(q)),
      )
      .map(({ storeTypeId: _, ...b }) => b);
  }),

  route.post('/api/v1/stores/{storeId}/catalog/brands', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const name = body.name?.trim();
    if (!name) throw fail.validation('name', 'نام برند را وارد کنید.');
    if (
      db
        .brands()
        .some(
          (b) =>
            (!b.ownerStoreId || b.ownerStoreId === params.storeId) &&
            normalizeTitle(b.name) === normalizeTitle(name),
        )
    )
      throw fail.conflict('BRAND_DUPLICATE', 'برندی با همین نام هست؛ همان را انتخاب کنید.');
    return db.mutate((s) => {
      const store = s.stores.find((x) => x.id === params.storeId);
      const b = {
        id: randomId(),
        name,
        nameEn: body.nameEn?.trim() || null,
        status: 'Private' as const,
        ownerStoreId: params.storeId,
        storeTypeId: store?.storeTypeId ?? null,
      };
      s.brands.push(b);
      const { storeTypeId: _, ...dto } = b;
      return dto;
    });
  }),
];
