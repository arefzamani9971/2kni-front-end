import type { Dto } from '@dukani/contracts';
import { categoriesByStoreType } from '../db/reference.constants';
import { normalizeTitle, parseBarcode, paginate } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import { route } from '../msw/route';
import { fail } from '../msw/problem';
import { MockProblem } from '../msw/mock-problem';
import { storeCategoryIds, visibleItems } from './catalog-items';
import { page, toCatalogItemDto, toCatalogSummary } from './dto';
import { planEntry } from './product-entry-plan';
import { commitEntry } from './product-entry-commit';

/** Demo transport for attach-only UI. PostgreSQL tests prove the production transaction guarantees. */
export function catalogAttachmentHandlers(db: MockDb) {
  const previews = new Map<
    string,
    { actor: string; store: string; body: string; value: Dto<'CatalogAttachmentPreviewDto'> }
  >();
  const operations = new Map<string, { actor: string; value: Dto<'CatalogAttachmentOperationDto'> }>();
  const candidates = (storeId: string, query: URLSearchParams) => {
    const mine = new Set(
      db.state.storeProducts.filter((p) => p.storeId === storeId).map((p) => p.catalogItemId),
    );
    const q = normalizeTitle(query.get('q') ?? '');
    const categoryIds = storeCategoryIds(db, storeId);
    const storeTypeId = db.state.stores.find((store) => store.id === storeId)?.storeTypeId;
    const hasSuggestions = !!storeTypeId && !!categoriesByStoreType.get(storeTypeId)?.size;
    return visibleItems(db, storeId)
      .filter((item) => {
        const type = db.productTypes().find((entry) => entry.id === item.productTypeId);
        return (
          (!hasSuggestions ||
            query.get('onlyStoreType') === 'false' ||
            item.ownerStoreId === storeId ||
            type?.ownerStoreId === storeId ||
            (!!type?.categoryId && categoryIds.has(type.categoryId))) &&
          (!q || normalizeTitle(item.title + ' ' + item.keyAttributes).includes(q)) &&
          (!query.get('categoryId') || type?.categoryId === query.get('categoryId')) &&
          (!query.get('productTypeId') || item.productTypeId === query.get('productTypeId')) &&
          (query.get('onlyNotInMyStore') !== 'true' || !mine.has(item.id))
        );
      })
      .map((item) => ({
        item: toCatalogSummary(db, item, storeId),
        units: toCatalogItemDto(db, item, storeId).units,
      }));
  };
  const inspect = (storeId: string, row: Dto<'CatalogAttachmentRow'>): Dto<'CatalogAttachmentPreviewRow'> => {
    try {
      const item = visibleItems(db, storeId).find((entry) => entry.id === row.catalogItemId);
      if (!item) throw fail.notFound('کالا');
      const unit = item.units.find((entry) => entry.id === row.catalogItemUnitId);
      if (!unit) throw fail.notFound('واحد');
      const product = db.state.storeProducts.find(
        (entry) => entry.storeId === storeId && entry.catalogItemId === item.id,
      );
      if (product?.status === 'Archived') throw fail.rule('CATALOG_ITEM_UNAVAILABLE', 'کالا بایگانی شده است');
      let code: string | null = null;
      if (row.localBarcode?.trim()) {
        const parsed = parseBarcode(row.localBarcode);
        if (!parsed.ok) throw fail.validation('localBarcode', 'بارکد نامعتبر');
        code = parsed.value;
        if (product) throw fail.versionConflict();
        if (
          visibleItems(db, storeId).some((entry) =>
            entry.units.some((u) => u.id !== unit.id && u.barcodes.some((b) => b.code === code)),
          ) ||
          db.state.storeProducts.some(
            (entry) =>
              entry.storeId === storeId &&
              entry.units.some((u) => u.catalogItemUnitId !== unit.id && u.barcodes.includes(code!)),
          )
        )
          throw fail.conflict('BARCODE_DUPLICATE', 'بارکد تکراری');
      }
      return {
        clientRowId: row.clientRowId,
        title: item.title,
        unitName: unit.name,
        originalBarcodes: unit.barcodes.map((b) => b.code),
        localBarcode: code,
        storeProductId: product?.id,
        errorCode: null,
      };
    } catch (error) {
      if (!(error instanceof MockProblem)) throw error;
      return {
        clientRowId: row.clientRowId,
        title: '',
        unitName: '',
        originalBarcodes: [],
        localBarcode: row.localBarcode,
        errorCode: error.code,
      };
    }
  };
  return [
    route.post('/api/v1/stores/{storeId}/catalog-attachments/candidates', ({ request, params, body }) => {
      db.requireMember(request, params.storeId, 'product.manage');
      const pageNumber = body.page ?? 1, pageSize = body.pageSize ?? 20;
      const sorts = body.sortModel ?? [];
      if (!Number.isInteger(pageNumber) || pageNumber < 1) throw fail.validation('page', 'صفحه نامعتبر');
      if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw fail.validation('pageSize', 'تعداد نامعتبر');
      if (sorts.length > 1 || sorts.some(rule => rule.colId !== 'title' || !['asc','desc'].includes(rule.sort))) throw fail.validation('sortModel', 'مرتب‌سازی نامعتبر');
      if ((body.q?.length ?? 0) > 100) throw fail.validation('q', 'جست‌وجوی طولانی');
      const query = new URLSearchParams(Object.entries({ ...body, onlyNotInMyStore: body.onlyNotInMyStore ?? true, onlyStoreType: body.onlyStoreType ?? true }).filter(([key,value]) => key !== 'sortModel' && value != null).map(([key,value]) => [key,String(value)]));
      const rows = candidates(params.storeId, query).sort((a,b) => (sorts[0]?.sort === 'desc' ? -1 : 1) * a.item.title.localeCompare(b.item.title,'fa') || a.item.id.localeCompare(b.item.id));
      const result = paginate(rows, pageNumber, pageSize);
      return { ...result, items: [...result.items] };
    }),
    route.get('/api/v1/stores/{storeId}/catalog-attachments', ({ request, params, query }) => {
      db.requireMember(request, params.storeId, 'product.manage');
      return page(candidates(params.storeId, query), query);
    }),
    route.post('/api/v1/stores/{storeId}/catalog-attachments/selection', ({ request, params, body }) => {
      db.requireMember(request, params.storeId, 'product.manage');
      const query = new URLSearchParams(
        Object.entries(body)
          .filter(([, value]) => value != null)
          .map(([key, value]) => [key, String(value)]),
      );
      const rows = candidates(params.storeId, query);
      if (rows.length > 1000) throw fail.validation('selection', 'حداکثر ۱۰۰۰ کالا');
      return rows;
    }),
    route.post('/api/v1/stores/{storeId}/catalog-attachments/preview', ({ request, params, body }) => {
      const { user } = db.requireMember(request, params.storeId, 'product.manage');
      if (body.rows.length < 1 || body.rows.length > 100) throw fail.validation('rows', 'بین ۱ تا ۱۰۰ کالا');
      const value = {
        rows: body.rows.map((row) => inspect(params.storeId, row)),
        previewToken: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 900000).toISOString(),
      };
      previews.set(value.previewToken, {
        actor: user.id,
        store: params.storeId,
        body: JSON.stringify(body.rows),
        value,
      });
      return value;
    }),
    route.post(
      '/api/v1/stores/{storeId}/catalog-attachments',
      ({ request, params, body, idempotencyKey }) => {
        const { user } = db.requireMember(request, params.storeId, 'product.manage');
        if (!idempotencyKey) throw fail.validation('Idempotency-Key', 'شناسه عملیات لازم است');
        const preview = previews.get(body.previewToken);
        if (
          !preview ||
          preview.actor !== user.id ||
          preview.store !== params.storeId ||
          preview.body !== JSON.stringify(body.rows) ||
          Date.parse(preview.value.expiresAt) <= Date.now()
        )
          throw fail.versionConflict();
        const results: Dto<'CatalogAttachmentResult'>[] = body.rows.map((row) => {
          const checked = inspect(params.storeId, row);
          if (checked.errorCode)
            return { clientRowId: row.clientRowId, status: 'Failed', errorCode: checked.errorCode };
          if (checked.storeProductId)
            return {
              clientRowId: row.clientRowId,
              status: 'AlreadyExists',
              storeProductId: checked.storeProductId,
            };
          const registration = { catalogItemId: row.catalogItemId };
          const result = commitEntry(
            db,
            params.storeId,
            registration,
            planEntry(db, params.storeId, registration, 'register'),
            row.clientRowId,
          );
          if (checked.localBarcode)
            db.mutate((state) => {
              const unit = state.storeProducts
                .find((p) => p.id === result.storeProductId)!
                .units.find((u) => u.catalogItemUnitId === row.catalogItemUnitId)!;
              if (!unit.barcodes.includes(checked.localBarcode!)) unit.barcodes.push(checked.localBarcode!);
            });
          return { clientRowId: row.clientRowId, status: 'Added', storeProductId: result.storeProductId };
        });
        const value: Dto<'CatalogAttachmentOperationDto'> = {
          operationId: idempotencyKey,
          state: 'Completed',
          results,
        };
        operations.set(params.storeId + ':' + idempotencyKey, { actor: user.id, value });
        return value;
      },
    ),
    route.get(
      '/api/v1/stores/{storeId}/catalog-attachments/operations/{operationId}',
      ({ request, params }) => {
        const { user } = db.requireMember(request, params.storeId, 'product.manage');
        const op = operations.get(params.storeId + ':' + params.operationId);
        if (!op || op.actor !== user.id) throw fail.notFound('عملیات');
        return op.value;
      },
    ),
  ];
}
