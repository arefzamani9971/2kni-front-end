import type { Dto } from '@dukani/contracts';
import { paginate, parseBarcode } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import { serverMessage } from '../msw/validation-copy';
import { units } from '../db/reference';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { page, toCatalogItemDto, toCatalogSummary } from './dto';
import { str } from '../db/wire';
import { createCatalogItem, titleCheck, visibleItems } from './catalog-items';
import { searchCatalogItems } from './catalog-search';
import { catalogTaxonomyHandlers } from './catalog-taxonomy';

/** Catalog module (store side): barcode lookup, item search/create, title check and units; taxonomy lives in catalog-taxonomy. */

export const catalogHandlers = (db: MockDb) => [
  route.get('/api/v1/stores/{storeId}/barcodes/{code}', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    const parsed = parseBarcode(decodeURIComponent(params.code));
    if (!parsed.ok)
      return {
        code: params.code,
        kind: 'Invalid' as const,
        matches: [],
        message: serverMessage(parsed.error),
      };
    const code = parsed.value as string;
    const matches: Dto<'BarcodeMatchDto'>[] = [];
    for (const item of visibleItems(db, params.storeId)) {
      for (const unit of item.units) {
        const sp = db.state.storeProducts.find(
          (p) => p.storeId === params.storeId && p.catalogItemId === item.id && p.status === 'Active',
        );
        const spu = sp?.units.find((u) => u.catalogItemUnitId === unit.id);
        if (!unit.barcodes.some((b) => b.code === code) && !spu?.barcodes.includes(code)) continue;
        matches.push({
          catalogItemId: item.id,
          catalogItemUnitId: unit.id,
          title: sp?.localTitle ?? item.title,
          unitName: unit.name,
          baseQty: str(unit.baseQty),
          storeProductId: sp?.id ?? null,
          storeProductUnitId: spu?.id ?? null,
          available: str(sp ? sp.onHand - sp.reserved : null),
          unitPriceAmount: str(
            spu?.salePrice ?? (sp?.baseSalePrice != null ? sp.baseSalePrice * unit.baseQty : null),
          ),
          catalogStatus: item.status,
          itemKind: item.kind ?? 'Goods',
          storeProductStatus: sp?.status ?? null,
          isSellable: spu?.isSellable ?? unit.isSellable,
          unitActive: true,
        });
      }
    }
    const kind: Dto<'BarcodeLookupKind'> =
      matches.length === 0
        ? 'Unknown'
        : matches.length > 1
          ? 'Multiple'
          : matches[0]!.storeProductId
            ? 'StoreProduct'
            : 'GlobalCatalog';
    return { code, kind, matches, message: null };
  }),

  route.get('/api/v1/stores/{storeId}/catalog/items', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    const items = searchCatalogItems(db, params.storeId, {
      q: query.get('q'),
      barcode: query.get('barcode'),
      categoryId: query.get('categoryId'),
      productTypeId: query.get('productTypeId'),
      brandId: query.get('brandId'),
      onlyNotInMyStore: query.get('onlyNotInMyStore') === 'true',
      onlyStoreType: query.get('onlyStoreType') === 'true',
    });
    const p = page(items, query);
    return { ...p, items: p.items.map((i) => toCatalogSummary(db, i, params.storeId)) };
  }),

  // F07 catalog list (PAT-LIST-01): same filter as the cursor GET, exact count, clamp, title order + id tie-break.
  route.post('/api/v1/stores/{storeId}/catalog/items/search', ({ request, params, body }) => {
    db.requireMember(request, params.storeId);
    const pageNumber = body.page ?? 1;
    const pageSize = body.pageSize ?? 20;
    const sorts = body.sortModel ?? [];
    if (!Number.isInteger(pageNumber) || pageNumber < 1) throw fail.validation('page', 'صفحه نامعتبر');
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100)
      throw fail.validation('pageSize', 'تعداد نامعتبر');
    if (
      sorts.length > 1 ||
      sorts.some((rule) => rule.colId !== 'title' || !['asc', 'desc'].includes(rule.sort))
    )
      throw fail.validation('sortModel', 'مرتب‌سازی نامعتبر');
    if ((body.q?.length ?? 0) > 120) throw fail.validation('q', 'عبارت جست‌وجو حداکثر ۱۲۰ نویسه است.');
    let barcode: string | null = null;
    if (body.barcode?.trim()) {
      const parsed = parseBarcode(body.barcode);
      if (!parsed.ok) throw fail.validation('barcode', serverMessage(parsed.error));
      barcode = parsed.value;
    }
    const direction = sorts[0]?.sort === 'desc' ? -1 : 1;
    const items = searchCatalogItems(db, params.storeId, { ...body, barcode }).sort(
      (a, b) => direction * a.title.localeCompare(b.title, 'fa') || a.id.localeCompare(b.id),
    );
    const result = paginate(items, pageNumber, pageSize);
    return { ...result, items: result.items.map((i) => toCatalogSummary(db, i, params.storeId)) };
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

  route.get('/api/v1/units', () => units),
  ...catalogTaxonomyHandlers(db),
];
