import { MockProblem } from '../msw/mock-problem';
import type { Dto } from '@dukani/contracts';
import { normalizeTitle } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { titleCheck } from './catalog-items';
import { num0, str } from '../db/wire';
import { planEntry } from './product-entry-plan';
import { commitEntry, resolveBulk } from './product-entry-commit';

/** Product entry: preview/register one row and bulk validate/commit (F08–F16). */
export const productEntryHandlers = (db: MockDb) => [
  route.post('/api/v1/stores/{storeId}/product-entry/preview', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const plan = planEntry(db, params.storeId, body, 'preview');
    return {
      title: plan.title,
      baseUnitName: plan.baseUnitName,
      qtyBase: str(plan.qtyBase),
      conversionText: plan.conversionText,
      costPerBaseAmount: str(plan.costPerBase),
      costStatus: plan.costStatus,
      salePriceAmount: str(plan.salePrice),
      isBelowCost: plan.isBelowCost,
      titleCheck: body.newCatalogItem
        ? titleCheck(db, params.storeId, body.newCatalogItem.title)
        : { normalizedTitle: normalizeTitle(plan.title), isAvailable: true, similarItems: [] },
      existingStoreProductId: plan.existing?.id ?? null,
      warnings: plan.warnings,
    };
  }),

  route.post(
    '/api/v1/stores/{storeId}/product-entry/register',
    ({ request, params, body, idempotencyKey }) => {
      db.requireMember(request, params.storeId, 'product.manage');
      if (!idempotencyKey)
        throw fail.validation('Idempotency-Key', 'شناسهٔ عملیات لازم است.', 'IDEMPOTENCY_KEY_REQUIRED');
      const plan = planEntry(db, params.storeId, body, 'register');
      return commitEntry(db, params.storeId, body, plan, idempotencyKey);
    },
  ),
  route.post('/api/v1/stores/{storeId}/product-entry/bulk/validate', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const registrations = resolveBulk(body);
    const rows: Dto<'BulkRowValidationDto'>[] = registrations.map((row, rowIndex) => {
      try {
        const plan = planEntry(db, params.storeId, row.registration, 'register');
        const unit = plan.item.units.find((u) => u.id === plan.entryCatalogUnitId);
        return {
          clientRowId: row.clientRowId,
          rowIndex,
          isValid: true,
          errors: [],
          warnings:
            row.registration.stock?.costStatus === 'Unknown'
              ? [{ fieldPath: 'stock.costStatus', code: 'COST_UNKNOWN' }]
              : [],
          resolvedSummary: {
            title: plan.title,
            unitName: unit?.name ?? plan.baseUnitName,
            baseUnitName: plan.baseUnitName,
            baseQty: str(unit?.baseQty ?? null),
            qtyBase: str(plan.qtyBase),
            lineAmount: str(plan.lineAmount),
            storeProductId: plan.existing?.id ?? null,
          },
        };
      } catch (error) {
        if (!(error instanceof MockProblem)) throw error;
        return {
          clientRowId: row.clientRowId,
          rowIndex,
          isValid: false,
          errors: Object.keys(error.errors ?? { registration: [] }).map((fieldPath) => ({
            fieldPath,
            code: error.code,
          })),
          warnings: [],
          resolvedSummary: null,
        };
      }
    });
    const stockRows = rows.filter((_, index) => registrations[index]?.registration.stock);
    return {
      rowCount: rows.length,
      validCount: rows.filter((r) => r.isValid).length,
      warningCount: rows.reduce((n, r) => n + r.warnings.length, 0),
      errorCount: rows.reduce((n, r) => n + r.errors.length, 0),
      rows,
      receiptTotals: {
        amount:
          stockRows.length > 0 && stockRows.every((r) => r.resolvedSummary?.lineAmount != null)
            ? str(stockRows.reduce((n, r) => n + num0(r.resolvedSummary?.lineAmount), 0))
            : null,
      },
    };
  }),
  route.post('/api/v1/stores/{storeId}/product-entry/bulk', ({ request, params, body, idempotencyKey }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    if (!idempotencyKey)
      throw fail.validation('Idempotency-Key', 'شناسهٔ عملیات لازم است.', 'IDEMPOTENCY_KEY_REQUIRED');
    const rows = resolveBulk(body);
    const plans = rows.map((row, i) => {
      try {
        return planEntry(db, params.storeId, row.registration, 'register');
      } catch (error) {
        if (!(error instanceof MockProblem)) throw error;
        throw new MockProblem(
          error.status,
          error.code,
          error.message,
          Object.fromEntries(
            Object.entries(error.errors ?? {}).map(([field, messages]) => [
              'rows[' + i + '].registration.' + field,
              messages,
            ]),
          ),
        );
      }
    });
    const snapshot = structuredClone(db.state);
    try {
      const results = rows.map((row, i) => ({
        ...commitEntry(
          db,
          params.storeId,
          row.registration,
          plans[i]!,
          idempotencyKey + ':' + row.clientRowId,
        ),
        clientRowId: row.clientRowId,
        rowIndex: i,
      }));
      const purchaseIds = results.flatMap((r) => (r.purchaseId ? [r.purchaseId] : []));
      const purchaseId = purchaseIds[0] ?? null;
      if (purchaseId)
        db.mutate((state) => {
          const receipts = state.purchases.filter((p) => purchaseIds.includes(p.id));
          const first = receipts[0]!;
          first.lines = receipts.flatMap((p) => p.lines);
          if (body.sharedReceipt?.documentDate)
            first.purchasedAt = body.sharedReceipt.documentDate + 'T00:00:00Z';
          state.purchases = state.purchases.filter((p) => !purchaseIds.includes(p.id) || p.id === purchaseId);
        });
      db.recordOperation(
        idempotencyKey,
        'RegisterBulk',
        purchaseId ? 'Purchase' : 'StoreProduct',
        purchaseId ?? results[0]!.storeProductId,
      );
      return {
        results: results.map((r) => ({ ...r, purchaseId: r.purchaseId ? purchaseId : null })),
        purchaseId,
      };
    } catch (error) {
      db.mutate((state) => Object.assign(state, snapshot));
      throw error;
    }
  }),
];
