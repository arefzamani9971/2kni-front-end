import type { Dto } from '@dukani/contracts';
import { normalizeTitle, parseBarcode } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import { serverMessage } from '../msw/validation-copy';
import { units } from '../db/reference';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { page, toCatalogItemDto, toCatalogSummary } from './dto';
import { str } from '../db/wire';
import { createCatalogItem, titleCheck, visibleItems } from './catalog-items';
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
    const q = normalizeTitle(query.get('q') ?? '');
    const barcode = query.get('barcode');
    const typeId = query.get('productTypeId');
    const brandId = query.get('brandId');
    const notMine = query.get('onlyNotInMyStore') === 'true';
    const mine = new Set(
      db.state.storeProducts.filter((p) => p.storeId === params.storeId).map((p) => p.catalogItemId),
    );
    const items = visibleItems(db, params.storeId).filter(
      (i) =>
        (!q ||
          q
            .split(' ')
            .every((w) =>
              normalizeTitle(
                [
                  i.title,
                  db.productTypes().find((t) => t.id === i.productTypeId)?.name,
                  db.brands().find((b) => b.id === i.brandId)?.name,
                  db.brands().find((b) => b.id === i.brandId)?.nameEn,
                  i.keyAttributes,
                ]
                  .filter(Boolean)
                  .join(' '),
              ).includes(w),
            )) &&
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

  route.get('/api/v1/units', () => units),
  ...catalogTaxonomyHandlers(db),
];
