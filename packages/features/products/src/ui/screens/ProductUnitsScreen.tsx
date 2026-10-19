'use client';
import { useCallback, useEffect } from 'react';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { canEditLocally } from '../../domain/lifecycle';
import { UnitsEditor } from '../components/UnitsEditor';
import { useProduct } from '../hooks/use-product';
import { ProductDetailScreen } from './ProductDetailScreen';

/**
 * UNIT-01 `~/products/[productId]/units` (F12 §2): the product detail with its units scene on top — a page on mobile,
 * a dialog over the detail on desktop. A service has no stock units; without `product.manage`, or for an archived
 * product (restored first), the route falls back to the detail.
 */
export function ProductUnitsScreen({ productId }: { productId: string }) {
  const store = useActiveStore();
  const nav = useNavigation();
  const allowed = useCan('product.manage');
  const product = useProduct(productId);
  // replace: the closed scene never comes back with the browser back button
  const back = useCallback(
    () => nav.replace(sellerRoutes.products.detail(store.id, productId)),
    [nav, store.id, productId],
  );
  const p = product.data;
  const editable = allowed && !!p && p.kind === 'Goods' && canEditLocally(p);
  useEffect(() => {
    if (p && !editable) back();
  }, [p, editable, back]);
  return (
    <>
      <ProductDetailScreen productId={productId} />
      {editable ? <UnitsEditor key={p.id} product={p} onClose={back} /> : null}
    </>
  );
}
