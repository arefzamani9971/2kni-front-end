import { round2 } from './money';
import type { Dto } from '@dukani/contracts';
import { normalizeTitle } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { isLowStock, page, productTitle, toProductDto, toProductSummary } from './dto';
import { pricePreview } from './pricing';
import { num0, str } from '../db/wire';

const shortcutConfiguration = (db: MockDb, storeId: string): Dto<'ShortcutConfigurationDto'> => {
  const products = db.state.storeProducts
    .filter((p) => p.storeId === storeId && p.shortcut)
    .sort(
      (a, b) =>
        (a.quickPickSortOrder ?? Infinity) - (b.quickPickSortOrder ?? Infinity) || a.id.localeCompare(b.id),
    );
  return {
    version: JSON.stringify(
      [...products]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((p) => [p.id, p.version, p.shortcut, p.showInQuickPick, p.quickPickSortOrder]),
    ),
    items: products.map((p) => ({
      storeProductId: p.id,
      title: productTitle(db, p),
      code: p.shortcut!,
      showInQuickPick: p.showInQuickPick ?? false,
      sortOrder: p.quickPickSortOrder ?? null,
      isEligible: p.status === 'Active' && p.units.some((u) => u.isSellable && !u.archivedAt),
    })),
  };
};

const STOCK_SORTS: Record<
  string,
  (a: Dto<'StoreProductSummaryDto'>, b: Dto<'StoreProductSummaryDto'>) => number
> = {
  title: (a, b) => a.title.localeCompare(b.title, 'fa'),
  stock: (a, b) => num0(a.available) - num0(b.available),
  stock_desc: (a, b) => num0(b.available) - num0(a.available),
  price: (a, b) => num0(a.baseSalePriceAmount) - num0(b.baseSalePriceAmount),
  price_desc: (a, b) => num0(b.baseSalePriceAmount) - num0(a.baseSalePriceAmount),
};

const ownProduct = (db: MockDb, storeId: string, productId: string) => {
  const p = db.state.storeProducts.find((x) => x.storeId === storeId && x.id === productId);
  if (!p) throw fail.notFound('کالا');
  return p;
};

/** D07: one active product per normalized effective title in a store (F11 local edit and restore). */
const ensureTitleFree = (db: MockDb, storeId: string, productId: string, title: string) => {
  const normalized = normalizeTitle(title);
  if (
    db.state.storeProducts.some(
      (x) =>
        x.storeId === storeId &&
        x.id !== productId &&
        x.status === 'Active' &&
        normalizeTitle(productTitle(db, x)) === normalized,
    )
  )
    throw fail.conflict(
      'TITLE_DUPLICATE',
      'کالای فعالی با همین عنوان در فروشگاه هست؛ مدل، رنگ یا بسته را در عنوان مشخص کنید.',
    );
};

/** Inventory registry: shortcuts, product list/detail, movements, price preview, local edit, archive and restore (F10, F11, F15–F16). */

export const productHandlers = (db: MockDb) => [
  route.get('/api/v1/stores/{storeId}/products/shortcuts', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    return shortcutConfiguration(db, params.storeId);
  }),
  route.put('/api/v1/stores/{storeId}/products/shortcuts', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    if (body.expectedVersion !== shortcutConfiguration(db, params.storeId).version)
      throw fail.rule('VERSION_CONFLICT', 'میان‌برها تغییر کرده‌اند.');
    const codes = body.items.map((i) => i.code.trim().toUpperCase());
    if (
      body.items.length > 500 ||
      new Set(body.items.map((i) => i.storeProductId)).size !== body.items.length ||
      new Set(codes).size !== codes.length ||
      codes.some((c) => !/^[\p{L}\p{N}_-]{1,16}$/u.test(c))
    )
      throw fail.validation('items', 'میان‌برها معتبر و یکتا نیستند.');
    const all = db.state.storeProducts.filter((p) => p.storeId === params.storeId);
    for (const input of body.items) {
      const p = all.find((p) => p.id === input.storeProductId);
      if (!p) throw fail.notFound('کالا');
      if (
        input.showInQuickPick &&
        (p.status !== 'Active' || !p.units.some((u) => u.isSellable && !u.archivedAt))
      )
        throw fail.rule('PRODUCT_INACTIVE', 'کالا قابل فروش نیست.');
    }
    const enabled = body.items
      .filter((i) => i.showInQuickPick)
      .sort(
        (a, b) =>
          (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity) ||
          a.storeProductId.localeCompare(b.storeProductId),
      );
    db.mutate(() => {
      for (const p of all) {
        const input = body.items.find((i) => i.storeProductId === p.id);
        p.shortcut = input?.code.trim().toUpperCase() ?? null;
        p.showInQuickPick = input?.showInQuickPick ?? false;
        p.quickPickSortOrder = input?.showInQuickPick
          ? enabled.findIndex((i) => i.storeProductId === p.id)
          : null;
        p.version++;
      }
    });
    return shortcutConfiguration(db, params.storeId);
  }),
  route.get('/api/v1/stores/{storeId}/products', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    const q = normalizeTitle(query.get('q') ?? '');
    const status = query.get('status') ?? 'Active';
    const stockState = query.get('stockState') ?? 'Any';
    const costStatus = query.get('costStatus');
    const items = db.state.storeProducts
      .filter((p) => p.storeId === params.storeId && p.status === status)
      .filter((p) => !query.get('kind') || (p.kind ?? 'Goods') === query.get('kind'))
      .filter((p) => !costStatus || p.costStatus === costStatus)
      .filter((p) => {
        const avail = p.onHand - p.reserved;
        if (stockState === 'Out') return avail <= 0;
        if (stockState === 'Low') return isLowStock(p) && avail > 0;
        if (stockState === 'InStock') return avail > 0;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((p) => toProductSummary(db, p))
      .filter((p) => !q || q.split(' ').every((w) => normalizeTitle(`${p.title} ${p.sku}`).includes(w)));
    const sorter = STOCK_SORTS[query.get('sort') ?? ''];
    return page(sorter ? items.sort(sorter) : items, query, 30);
  }),

  route.get('/api/v1/stores/{storeId}/products/{productId}', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    const p = db.state.storeProducts.find((x) => x.id === params.productId && x.storeId === params.storeId);
    if (!p) throw fail.notFound('کالا');
    return toProductDto(db, p);
  }),

  route.get('/api/v1/stores/{storeId}/inventory/{productId}/movements', ({ request, params, query }) => {
    db.requireMember(request, params.storeId, 'stock.view');
    const p = db.state.storeProducts.find((x) => x.id === params.productId && x.storeId === params.storeId);
    if (!p) throw fail.notFound('کالا');
    // receipts come from finalized purchases; the remaining difference to on-hand is shown as sales (no sales module yet)
    let balance = 0;
    const moves: Dto<'StockMovementDto'>[] = [];
    for (const pur of db.state.purchases
      .filter((x) => x.storeId === params.storeId && x.status === 'Finalized')
      .sort((a, b) => a.purchasedAt.localeCompare(b.purchasedAt))) {
      for (const l of pur.lines.filter((x) => x.storeProductId === p.id)) {
        const unit = p.units.find((u) => u.id === l.storeProductUnitId);
        const qtyBase = l.quantity * (unit?.baseQty ?? 1);
        balance += qtyBase;
        moves.push({
          id: l.id,
          occurredAt: pur.finalizedAt ?? pur.purchasedAt,
          type: pur.kind === 'Opening' ? 'Opening' : 'Purchase',
          qtyBase: str(qtyBase),
          balanceAfter: str(balance),
          unitCostAmount: str(l.unitCost !== null ? round2(l.unitCost / (unit?.baseQty ?? 1)) : null),
          costKnown: l.costStatus !== 'Unknown',
          refType: 'purchase',
          refId: pur.id,
          refNumber: pur.number !== null ? String(pur.number) : null,
          note: null,
        });
      }
    }
    if (balance !== p.onHand)
      moves.push({
        id: `${p.id}-sales`,
        occurredAt: new Date().toISOString(),
        type: balance > p.onHand ? 'Sale' : 'Adjustment',
        qtyBase: str(p.onHand - balance),
        balanceAfter: str(p.onHand),
        unitCostAmount: null,
        costKnown: false,
        refType: 'sale',
        refId: p.id,
        refNumber: null,
        note: balance > p.onHand ? 'فروش‌های ثبت‌شده' : 'اصلاح موجودی',
      });
    return page(moves.reverse(), query, 30);
  }),

  route.post('/api/v1/stores/{storeId}/products/pricing/preview', ({ request, params, body }) => {
    db.requireMember(request, params.storeId);
    return pricePreview(body);
  }),
  route.put('/api/v1/stores/{storeId}/products/{productId}/local', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const p = ownProduct(db, params.storeId, params.productId);
    if (body.expectedVersion !== p.version) throw fail.versionConflict();
    if (p.status === 'Archived')
      throw fail.rule('PRODUCT_INACTIVE', 'کالای بایگانی‌شده را ابتدا بازیابی کنید.');
    const localTitle = body.localTitle?.trim() || null;
    const localNote = body.localNote?.trim() || null;
    if ((localTitle?.length ?? 0) > 250) throw fail.validation('localTitle', 'نام محلی حداکثر ۲۵۰ حرف است.');
    if ((localNote?.length ?? 0) > 1000) throw fail.validation('localNote', 'یادداشت حداکثر ۱۰۰۰ حرف است.');
    const isService = p.kind === 'Service';
    if (!isService && (body.setServiceCost || body.serviceCostAmount != null))
      throw fail.rule(
        'SERVICE_COST_NOT_ALLOWED',
        'بهای تمام‌شدهٔ دستی فقط برای خدمت است؛ بهای کالا از خرید می‌آید.',
      );
    const catalogTitle = db.catalogItems().find((i) => i.id === p.catalogItemId)?.title ?? '';
    ensureTitleFree(db, params.storeId, p.id, localTitle ?? catalogTitle);
    return db.mutate((s) => {
      const row = s.storeProducts.find((x) => x.id === p.id)!;
      row.localTitle = localTitle;
      row.localNote = localNote;
      row.shortcut = body.shortcut?.trim() ? body.shortcut.trim().toUpperCase() : null;
      if (body.setServiceCost)
        row.serviceCostAmount = body.serviceCostAmount == null ? null : Number(body.serviceCostAmount);
      row.version += 1;
      return toProductDto(db, row);
    });
  }),

  route.post('/api/v1/stores/{storeId}/products/{productId}/archive', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const p = ownProduct(db, params.storeId, params.productId);
    if (p.status === 'Archived') return toProductDto(db, p); // a repeat is a no-op
    if (body.expectedVersion !== p.version) throw fail.versionConflict();
    return db.mutate((s) => {
      const row = s.storeProducts.find((x) => x.id === p.id)!;
      row.status = 'Archived';
      row.version += 1;
      return toProductDto(db, row);
    });
  }),

  route.post('/api/v1/stores/{storeId}/products/{productId}/restore', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const p = ownProduct(db, params.storeId, params.productId);
    if (p.status === 'Active') return toProductDto(db, p);
    if (body.expectedVersion !== p.version) throw fail.versionConflict();
    ensureTitleFree(db, params.storeId, p.id, productTitle(db, p));
    return db.mutate((s) => {
      const row = s.storeProducts.find((x) => x.id === p.id)!;
      row.status = 'Active';
      row.version += 1;
      return toProductDto(db, row);
    });
  }),
];
