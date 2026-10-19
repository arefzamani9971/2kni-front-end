import { normalizeTitle, parseBarcode } from '@dukani/domain';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db.types';
import { unitById } from '../db/reference';
import type { StoreProductRecord } from '../db/state';
import { num, num0 } from '../db/wire';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { visibleItems } from './catalog-items';
import { toProductDto } from './dto';

/**
 * Store units of a product (F12 §4–§9), with the server's rules: Idempotency-Key replay comes from `route`; the
 * product version, one use at least, a positive price, a factor within the base unit's decimals and 10⁹, a name not
 * used by another active unit after normalization, a free barcode; the base unit is never archived nor given a second
 * price; an archive repeats as a no-op.
 */
export function productUnitHandlers(db: MockDb) {
  const load = (storeId: string, productId: string, expectedVersion: number) => {
    const p = db.state.storeProducts.find((x) => x.storeId === storeId && x.id === productId);
    if (!p) throw fail.notFound('کالا');
    if (p.version !== expectedVersion) throw fail.versionConflict();
    if (p.status !== 'Active')
      throw fail.rule('PRODUCT_INACTIVE', 'کالای بایگانی‌شده را ابتدا بازیابی کنید.');
    return p;
  };
  const uses = (sellable: boolean, purchasable: boolean) => {
    if (!sellable && !purchasable)
      throw fail.validation('isPurchasable', 'واحد باید برای خرید یا فروش قابل استفاده باشد.');
  };
  const price = (amount: string | null | undefined) => {
    const value = num(amount);
    if (value !== null && !(value > 0))
      throw fail.validation('salePriceAmount', 'قیمت باید بیشتر از صفر باشد و حداکثر دو رقم اعشار دارد.');
    return value;
  };
  const barcodeTaken = (storeId: string, code: string) =>
    db.state.storeProducts.some(
      (p) => p.storeId === storeId && p.units.some((u) => u.barcodes.includes(code)),
    ) || visibleItems(db, storeId).some((i) => i.units.some((u) => u.barcodes.some((b) => b.code === code)));
  const touch = (p: StoreProductRecord) => {
    p.version += 1;
    return toProductDto(db, p);
  };

  return [
    route.post('/api/v1/stores/{storeId}/products/{productId}/units', ({ request, params, body }) => {
      db.requireMember(request, params.storeId, 'product.manage');
      const p = load(params.storeId, params.productId, body.expectedVersion);
      if (p.kind === 'Service') throw fail.validation('name', 'خدمت موجودی ندارد و واحد بسته‌بندی نمی‌گیرد.');
      const name = body.name.trim();
      if (!name || name.length > 80) throw fail.validation('name', 'نام واحد باید بین ۱ تا ۸۰ نویسه باشد.');
      uses(body.isSellable, body.isPurchasable);
      const salePrice = price(body.salePriceAmount);
      const baseQty = num0(body.baseQty);
      const item = db.catalogItems().find((i) => i.id === p.catalogItemId)!;
      const maxDecimals = Math.min(3, unitById(item.baseUnitId)?.maxDecimals ?? 0);
      const decimals = (String(body.baseQty).split('.')[1] ?? '').length;
      if (!(baseQty > 0) || baseQty > 1_000_000_000 || decimals > maxDecimals)
        throw fail.validation('baseQty', 'تعداد داخل بسته نامعتبر است.', 'QUANTITY_INVALID');
      const normalized = normalizeTitle(name);
      if (p.units.some((u) => !u.archivedAt && normalizeTitle(u.name) === normalized))
        throw fail.rule('UNIT_DUPLICATE', 'واحدی با همین نام برای این کالا ثبت شده است.');
      let barcode: string | null = null;
      if (body.barcode?.trim()) {
        const parsed = parseBarcode(body.barcode);
        if (!parsed.ok) throw fail.validation('barcode', 'بارکد معتبر نیست.', 'BARCODE_INVALID');
        if (barcodeTaken(params.storeId, parsed.value))
          throw fail.conflict('BARCODE_DUPLICATE', 'این بارکد قبلاً برای کالای دیگری ثبت شده است.');
        barcode = parsed.value;
      }
      return db.mutate(() => {
        p.units.push({
          id: randomId(),
          catalogItemUnitId: null,
          name,
          baseQty,
          salePrice,
          isSellable: body.isSellable,
          isPurchasable: body.isPurchasable,
          barcodes: barcode ? [barcode] : [],
          archivedAt: null,
          isBase: false,
        });
        return touch(p);
      });
    }),

    route.put('/api/v1/stores/{storeId}/products/{productId}/units/{unitId}', ({ request, params, body }) => {
      db.requireMember(request, params.storeId, 'price.change');
      const p = load(params.storeId, params.productId, body.expectedVersion);
      const unit = p.units.find((u) => u.id === params.unitId && !u.archivedAt);
      if (!unit) throw fail.notFound('واحد');
      uses(body.isSellable, body.isPurchasable);
      const salePrice = price(body.salePriceAmount);
      if (unit.isBase && salePrice !== null && salePrice !== unit.salePrice)
        throw fail.validation(
          'salePriceAmount',
          'قیمت واحد پایه از روش قیمت‌گذاری کالا می‌آید؛ آن را در صفحهٔ قیمت تغییر دهید.',
        );
      return db.mutate(() => {
        unit.salePrice = salePrice;
        unit.isSellable = body.isSellable;
        unit.isPurchasable = body.isPurchasable;
        return touch(p);
      });
    }),

    route.post(
      '/api/v1/stores/{storeId}/products/{productId}/units/{unitId}/archive',
      ({ request, params, body }) => {
        db.requireMember(request, params.storeId, 'product.manage');
        const p = db.state.storeProducts.find(
          (x) => x.storeId === params.storeId && x.id === params.productId,
        );
        if (!p) throw fail.notFound('کالا');
        const unit = p.units.find((u) => u.id === params.unitId);
        if (!unit) throw fail.notFound('واحد');
        if (unit.archivedAt) return toProductDto(db, p); // a repeat is a no-op, even with an old version
        if (p.version !== body.expectedVersion) throw fail.versionConflict();
        if (unit.isBase)
          throw fail.rule(
            'UNIT_LOCKED',
            'واحد پایه بایگانی نمی‌شود؛ موجودی بر اساس همین واحد نگهداری می‌شود.',
          );
        return db.mutate(() => {
          unit.archivedAt = new Date().toISOString();
          return touch(p);
        });
      },
    ),
  ];
}
