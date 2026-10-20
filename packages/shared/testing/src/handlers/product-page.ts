import { normalizeTitle, paginate } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import type { StoreProductRecord } from '../db/state';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { toProductSummary } from './dto';

/** Mock stock history: a finalized receipt line or any stock on hand (the mock has no movement ledger). */
export const hasStockHistory = (db: MockDb, p: StoreProductRecord) =>
  p.onHand !== 0 ||
  db.state.purchases.some((x) => x.status === 'Finalized' && x.lines.some((l) => l.storeProductId === p.id));

const primaryBarcode = (p: StoreProductRecord) =>
  [...p.units]
    .filter((u) => !u.archivedAt)
    .sort((a, b) => Number(b.isBase) - Number(a.isBase) || a.baseQty - b.baseQty)
    .flatMap((u) => u.barcodes)[0] ?? null;

/** `POST …/products/search`: the paged product list of the opening pick and the purchase autocomplete (F13). */
export const productPageHandlers = (db: MockDb) => [
  route.post('/api/v1/stores/{storeId}/products/search', ({ request, params, body }) => {
    db.requireMember(request, params.storeId);
    const pageNumber = body.page ?? 1;
    const pageSize = body.pageSize ?? 20;
    const sorts = body.sortModel ?? [];
    if (!Number.isInteger(pageNumber) || pageNumber < 1)
      throw fail.validation('page', 'شماره صفحه باید مثبت باشد.');
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100)
      throw fail.validation('pageSize', 'تعداد نتیجه باید بین ۱ و ۱۰۰ باشد.');
    if (
      sorts.length > 1 ||
      sorts.some((r) => !['title', 'onHand'].includes(r.colId) || !['asc', 'desc'].includes(r.sort))
    )
      throw fail.validation('sortModel', 'مرتب‌سازی نامعتبر است.');
    const words = normalizeTitle(body.q ?? '')
      .split(' ')
      .filter(Boolean);
    const rows = db.state.storeProducts
      .filter((p) => p.storeId === params.storeId && p.status === 'Active')
      .filter((p) => !body.kind || (p.kind ?? 'Goods') === body.kind)
      .filter((p) => !body.withoutStockHistory || !hasStockHistory(db, p))
      .map((p) => ({ record: p, product: toProductSummary(db, p) }))
      .filter(({ record, product }) => {
        const text = normalizeTitle(
          `${product.title} ${product.sku} ${record.units.flatMap((u) => u.barcodes).join(' ')}`,
        );
        return words.every((w) => text.includes(w));
      });
    const rule = sorts[0];
    const sign = rule?.sort === 'desc' ? -1 : 1;
    rows.sort(
      (a, b) =>
        sign *
          (rule?.colId === 'onHand'
            ? a.record.onHand - b.record.onHand
            : a.product.title.localeCompare(b.product.title, 'fa')) || a.record.id.localeCompare(b.record.id),
    );
    const result = paginate(rows, pageNumber, pageSize);
    return {
      ...result,
      items: result.items.map(({ record, product }) => ({
        product,
        hasStockHistory: hasStockHistory(db, record),
        barcode: primaryBarcode(record),
      })),
    };
  }),
];
