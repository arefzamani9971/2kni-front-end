'use client';
import type { Dto } from '@dukani/contracts';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { FeatureAction } from '@dukani/ui-kit';
import { canEditLocally } from '../../domain/lifecycle';
import { useProductTranslations } from '../i18n/use-product-translations';
import { ProductLifecycleActions } from './ProductLifecycleActions';

/**
 * Detail actions (Figma 312:9534 / 312:1441): outline buttons on mobile, «Desktop Action Tile» cards on desktop —
 * local name and note, catalog correction (public items only), «my product is different» (a new product, F11 §9)
 * and archive/restore. They need `product.manage`; an archived product only offers restore.
 */
export function ProductActions({ product: p }: { product: Dto<'StoreProductDto'> }) {
  const t = useProductTranslations();
  const store = useActiveStore();
  const nav = useNavigation();
  const canManage = useCan('product.manage');
  if (!canManage) return null;
  const active = canEditLocally(p);
  return (
    <div className="desktop:grid desktop:grid-cols-4 desktop:gap-6 flex flex-col gap-3">
      {active && p.kind === 'Goods' ? (
        <FeatureAction
          icon="edit"
          label={t('alias.title')}
          onClick={() => nav.push(sellerRoutes.products.barcodeAlias(store.id, p.id))}
        />
      ) : null}
      {active ? (
        <FeatureAction
          icon="edit"
          label={t('localDetails')}
          onClick={() => nav.push(sellerRoutes.products.local(store.id, p.id))}
        />
      ) : null}
      {/* a private item is edited directly; only public catalog data takes a correction (F11 §4) */}
      {active && p.catalogStatus === 'Public' ? (
        <FeatureAction
          icon="alert-warning"
          label={t('correction')}
          onClick={() => nav.push(sellerRoutes.catalog.correction(store.id, p.catalogItemId, p.id))}
        />
      ) : null}
      {active ? (
        <FeatureAction
          icon="package-plus"
          label={t('different')}
          onClick={() => nav.push(sellerRoutes.entry.method(store.id))}
        />
      ) : null}
      <ProductLifecycleActions product={p} />
    </div>
  );
}
