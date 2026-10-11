'use client';
import { useCallback, useEffect } from 'react';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { canEditLocally } from '../../domain/lifecycle';
import { LocalEditor } from '../components/LocalEditor';
import { useProduct } from '../hooks/use-product';
import { ProductDetailScreen } from './ProductDetailScreen';

/**
 * PRD-LOCAL-EDIT `~/products/[productId]/local` (F11): the product detail with the local edit on top — a page on
 * mobile (Figma 312:9574), a dialog over the detail on desktop (312:1499). Without `product.manage`, or for an
 * archived product (restored first, F11 §10.7), the route falls back to the detail.
 */
export function ProductLocalScreen({ productId }: { productId: string }) {
  const store = useActiveStore();
  const nav = useNavigation();
  const allowed = useCan('product.manage');
  const product = useProduct(productId);
  // replace: the finished or abandoned form never comes back with the browser back button
  const back = useCallback(
    () => nav.replace(sellerRoutes.products.detail(store.id, productId)),
    [nav, store.id, productId],
  );
  const p = product.data;
  const editable = allowed && !!p && canEditLocally(p);
  useEffect(() => {
    if (p && !editable) back();
  }, [p, editable, back]);
  return (
    <>
      <ProductDetailScreen productId={productId} />
      {editable ? <LocalEditor key={p.id} product={p} onDone={back} /> : null}
    </>
  );
}
