import type { Dto } from '@dukani/contracts';
import { parseBarcode } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import { route } from '../msw/route';
import { fail } from '../msw/problem';
import { productTitle } from './dto';
import { visibleItems } from './catalog-items';
import { str } from '../db/wire';

export function barcodeAliasHandlers(db: MockDb) {
  const previews = new Map<
    string,
    { actor: string; storeId: string; value: Dto<'BarcodeAliasPreviewDto'> }
  >();
  const inspect = (storeId: string, productId: string, body: Dto<'PreviewBarcodeAliasRequest'>) => {
    const parsed = parseBarcode(body.barcode);
    if (!parsed.ok) throw fail.validation('barcode', 'بارکد معتبر وارد کنید.');
    const product = db.state.storeProducts.find((p) => p.storeId === storeId && p.id === productId);
    if (!product) throw fail.notFound('کالا');
    if (product.version !== body.expectedVersion) throw fail.versionConflict();
    if (product.status !== 'Active' || product.kind === 'Service')
      throw fail.rule('CATALOG_ITEM_UNAVAILABLE', 'کالا در دسترس نیست.');
    const unit = product.units.find((u) => u.id === body.storeProductUnitId && !u.archivedAt);
    if (!unit) throw fail.notFound('واحد');
    const code = parsed.value;
    const conflict =
      db.state.storeProducts.some(
        (p) => p.storeId === storeId && p.units.some((u) => u.id !== unit.id && u.barcodes.includes(code)),
      ) ||
      visibleItems(db, storeId).some((p) =>
        p.units.some((u) => u.id !== unit.catalogItemUnitId && u.barcodes.some((b) => b.code === code)),
      );
    if (conflict) throw fail.conflict('BARCODE_DUPLICATE', 'این بارکد به کالا یا واحد دیگری تعلق دارد.');
    return { product, unit, code };
  };
  return [
    route.post(
      '/api/v1/stores/{storeId}/products/{productId}/barcode-aliases/preview',
      ({ request, params, body }) => {
        const { user } = db.requireMember(request, params.storeId, 'product.manage');
        const { product, unit, code } = inspect(params.storeId, params.productId, body);
        const token = crypto.randomUUID();
        const value: Dto<'BarcodeAliasPreviewDto'> = {
          storeProductId: product.id,
          storeProductUnitId: unit.id,
          title: productTitle(db, product),
          unitName: unit.name,
          baseQty: str(unit.baseQty),
          existingBarcodes: [...unit.barcodes].sort(),
          barcode: code,
          alreadyExists: unit.barcodes.includes(code),
          expectedVersion: product.version,
          previewToken: token,
          expiresAt: new Date(Date.now() + 900000).toISOString(),
        };
        previews.set(token, { actor: user.id, storeId: params.storeId, value });
        return value;
      },
    ),
    route.post(
      '/api/v1/stores/{storeId}/products/{productId}/barcode-aliases',
      ({ request, params, body, idempotencyKey }) => {
        const { user } = db.requireMember(request, params.storeId, 'product.manage');
        if (!idempotencyKey)
          throw fail.validation('Idempotency-Key', 'شناسه عملیات لازم است.', 'IDEMPOTENCY_KEY_REQUIRED');
        const { product, unit, code } = inspect(params.storeId, params.productId, body);
        const saved = previews.get(body.previewToken);
        if (
          !saved ||
          saved.actor !== user.id ||
          saved.storeId !== params.storeId ||
          saved.value.storeProductId !== product.id ||
          saved.value.storeProductUnitId !== unit.id ||
          saved.value.barcode !== code ||
          new Date(saved.value.expiresAt).getTime() <= Date.now() ||
          JSON.stringify(saved.value.existingBarcodes) !== JSON.stringify([...unit.barcodes].sort())
        )
          throw fail.versionConflict();
        const alreadyExists = unit.barcodes.includes(code);
        if (!alreadyExists) db.mutate(() => unit.barcodes.push(code));
        return { storeProductId: product.id, storeProductUnitId: unit.id, barcode: code, alreadyExists };
      },
    ),
  ];
}
