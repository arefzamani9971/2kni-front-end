'use client';
import { useProductTranslations } from '../i18n/use-product-translations';
import { useProductPresentation } from '../i18n/use-product-presentation';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Alert,
  Button,
  ButtonLink,
  ListRow,
  PageShell,
  PageState,
  Section,
  StockMovementRow,
} from '@dukani/ui-kit';
import { useMovements } from '../hooks/use-movements';
import { useProduct } from '../hooks/use-product';

/** detail (Figma 312:9534, newdetail 312:10745): stock, prices and history of one store product. */
export function ProductDetailScreen({ productId }: { productId: string }) {
  const t = useProductTranslations();
  const presentation = useProductPresentation();

  const store = useActiveStore();
  const nav = useNavigation();
  const canStock = useCan('purchase.manage');
  const product = useProduct(productId);
  const moves = useMovements(productId);
  const p = product.data;
  const back = () => nav.push(sellerRoutes.products.list(store.id));

  return (
    <PageShell
      title={p?.title ?? t('product')}
      subtitle={t('storeSubtitle', { name: store.name })}
      actions={
        <>
          {canStock && p ? (
            <Button
              block
              onClick={() => nav.push(`${sellerRoutes.purchases.new(store.id)}?productId=${p.id}`)}
            >
              {t('addStock')}
            </Button>
          ) : null}
          <Button variant="secondary" block onClick={back}>
            {t('back')}
          </Button>
        </>
      }
    >
      {product.isPending ? <PageState kind="loading" rows={3} /> : null}
      {product.error ? (
        <PageState
          kind={product.error.kind === 'NotFound' ? 'not-found' : 'error'}
          description={product.error.message}
        />
      ) : null}
      {p ? (
        <>
          {p.isBelowCost ? (
            <Alert tone="warning" title={t('belowCost')} description={t('reviewPrice')} />
          ) : null}
          {p.costStatus === 'Unknown' ? (
            <Alert tone="warning" title={t('unknownCost')} description={t('unknownCostHint')} />
          ) : null}
          <Section title={t('inventoryPrice')}>
            {presentation.detailRows(p).map((r) => (
              <ListRow key={r}>{r}</ListRow>
            ))}
            <ListRow>
              {t('sku')}
              <bdi>{p.sku}</bdi>
              {p.catalogStatus === 'Private' || p.catalogStatus === 'PendingReview'
                ? t('privateCatalog')
                : ''}
            </ListRow>
          </Section>
          <Section title={t('history')}>
            {moves.isPending ? <PageState kind="loading" rows={2} /> : null}
            {moves.data?.items.length === 0 ? (
              <p className="text-body-m text-fg-secondary">{t('noMovements')}</p>
            ) : null}
            {moves.data?.items.map((m) => (
              <StockMovementRow key={m.id} {...presentation.movementView(m, p.baseUnitName)} />
            ))}
            <ButtonLink href={`${sellerRoutes.products.detail(store.id, p.id)}/local`}>
              {t('localDetails')}
            </ButtonLink>
            <ButtonLink href={`/s/${store.id}/catalog/${p.catalogItemId}/correction`}>
              {t('correction')}
            </ButtonLink>
          </Section>
        </>
      ) : null}
    </PageShell>
  );
}
