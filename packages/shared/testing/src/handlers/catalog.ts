import type { Dto } from '@dukani/contracts';
import { normalizeTitle, parseBarcode } from '@dukani/domain';
import { randomId } from '../db/ids';
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
        if (!unit.barcodes.some((b) => b.code === code)) continue;
        const sp = db.state.storeProducts.find(
          (p) => p.storeId === params.storeId && p.catalogItemId === item.id && p.status === 'Active',
        );
        const spu = sp?.units.find((u) => u.catalogItemUnitId === unit.id);
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
  route.post(
    '/api/v1/stores/{storeId}/catalog/items/{itemId}/corrections',
    ({ request, params, body, idempotencyKey }) => {
      db.requireMember(request, params.storeId, 'product.manage');
      if (!idempotencyKey) throw fail.validation('operationId', 'شناسه عملیات لازم است.');
      const item = db
        .catalogItems()
        .find(
          (i) => i.id === params.itemId && (i.ownerStoreId === null || i.ownerStoreId === params.storeId),
        );
      if (!item) throw fail.notFound('کالا');
      if (item.ownerStoreId === params.storeId)
        throw fail.rule('CATALOG_ITEM_NOT_EDITABLE', 'کالای خصوصی را مستقیم ویرایش کنید.');
      const entries = Object.entries(body.proposedChanges ?? {});
      const reason = body.reason?.trim();
      if (
        !reason ||
        reason.length > 2000 ||
        entries.length < 1 ||
        entries.length > 30 ||
        entries.some(
          ([k, v]) =>
            !k.trim() || k.trim().length > 80 || k.trim().startsWith('__') || (v?.length ?? 0) > 2000,
        ) ||
        new Set(entries.map(([k]) => k.trim())).size !== entries.length
      )
        throw fail.validation('proposedChanges', 'پیشنهاد و دلیل معتبر لازم است.');
      const evidence = body.evidenceFileIds ?? [];
      if (
        evidence.length > 10 ||
        evidence.some((id) => !db.state.files.some((f) => f.id === id && f.storeId === params.storeId))
      )
        throw fail.validation('evidenceFileIds', 'مدرک باید متعلق به فروشگاه باشد.');
      if (
        db.state.corrections?.some(
          (c) =>
            c.storeId === params.storeId &&
            c.catalogItemId === params.itemId &&
            ['Submitted', 'Reviewing', 'NeedInfo', 'Appealed'].includes(c.status),
        )
      )
        throw fail.conflict('CATALOG_CORRECTION_OPEN', 'درخواست اصلاح باز دارید.');
      return db.mutate((s) => {
        const createdAt = new Date().toISOString();
        const result: Dto<'CorrectionRequestDto'> = {
          id: randomId(),
          catalogItemId: item.id,
          productTypeId: null,
          subject: item.title,
          status: 'Submitted',
          proposedChanges: Object.fromEntries(entries.map(([k, v]) => [k.trim(), v])),
          reason,
          evidenceFileIds: evidence,
          decisionReason: null,
          createdAt,
          history: [{ at: createdAt, status: 'Submitted', note: null }],
        };
        (s.corrections ??= []).push({ ...result, storeId: params.storeId });
        return result;
      });
    },
  ),

  ...catalogTaxonomyHandlers(db),
];
