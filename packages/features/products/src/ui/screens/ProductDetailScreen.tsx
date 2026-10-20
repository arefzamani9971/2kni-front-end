'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useProductTranslations } from '../i18n/use-product-translations';
import { useProductPresentation } from '../i18n/use-product-presentation';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ListRow, PageShell, PageState, Section, StockMovementRow } from '@dukani/ui-kit';
import { isArchived } from '../../domain/lifecycle';
import { CorrectionStatusRow } from '../components/CorrectionStatusRow';
import { ProductActions } from '../components/ProductActions';
import { ProductIdentitySection } from '../components/ProductIdentitySection';
import { useMovements } from '../hooks/use-movements';
import { useProduct } from '../hooks/use-product';

/**
 * detail (Figma 312:9534 / desktop 312:1441, newdetail 312:10745): «موجودی و قیمت» and «سوابق» (side by side on
 * desktop), the F11 actions, then the identity the spec requires (store and catalog names, note, SKU). Mobile keeps
 * «افزودن موجودی / بازگشت» as persistent actions; desktop shows them in the page header.
 */
export function ProductDetailScreen({ productId }: { productId: string }) {
  const t = useProductTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = useProductPresentation();

  const store = useActiveStore();
  const nav = useNavigation();
  const canStock = useCan('purchase.manage');
  const product = useProduct(productId);
  const moves = useMovements(productId, product.data?.kind === 'Goods');
  const p = product.data;
  const headline = p ? presentation.stockHeadline(p) : null;
  const back = () => nav.push(sellerRoutes.products.list(store.id));
  const addStock =
    canStock && p?.kind === 'Goods' && !isArchived(p)
      ? () => nav.push(sellerRoutes.purchases.continuous(store.id, p.id))
      : null;
  const actions = (desktop: boolean) => (
    <>
      {addStock ? (
        <Button block={!desktop} onClick={addStock}>
          {t('addStock')}
        </Button>
      ) : null}
      <Button variant="secondary" block={!desktop} onClick={back}>
        {t('back')}
      </Button>
    </>
  );

  return (
    <PageShell
      title={p?.title ?? t('product')}
      subtitle={t('storeSubtitle', { name: store.name })}
      breadcrumb={t('detailBreadcrumb')}
      headerActions={<div className="desktop:flex hidden flex-row-reverse gap-2">{actions(true)}</div>}
      actions={actions(false)}
      actionsClassName="desktop:hidden"
    >
      {product.isPending ? <PageState kind="loading" rows={3} /> : null}
      {product.error ? (
        <PageState
          kind={product.error.kind === 'NotFound' ? 'not-found' : 'error'}
          description={errorMessage(product.error)}
        />
      ) : null}
      {p ? (
        <>
          {isArchived(p) ? (
            <Alert
              tone="warning"
              title={t('lifecycle.archivedTitle')}
              description={t('lifecycle.archivedHint')}
            />
          ) : null}
          {p.isBelowCost ? (
            <Alert tone="warning" title={t('belowCost')} description={t('reviewPrice')} />
          ) : null}
          {p.costStatus === 'Unknown' ? (
            <Alert tone="warning" title={t('unknownCost')} description={t('unknownCostHint')} />
          ) : null}
          <div className="desktop:grid desktop:grid-cols-2 desktop:items-start desktop:gap-6 flex flex-col gap-4">
            <Section title={t('inventoryPrice')}>
              {headline ? (
                <>
                  {/* Figma 312:1441 (desktop) heads the card with it; 312:9534 (mobile) lists it as a row */}
                  <p className="desktop:block text-heading-xl text-fg-brand hidden">{headline}</p>
                  <ListRow className="desktop:hidden">{headline}</ListRow>
                </>
              ) : null}
              {presentation.detailRows(p).map((r) => (
                <ListRow key={r}>{r}</ListRow>
              ))}
              {p.catalogStatus === 'Private' || p.catalogStatus === 'PendingReview' ? (
                <ListRow>{t('privateCatalog')}</ListRow>
              ) : null}
            </Section>
            <Section title={t('history')}>
              {p.kind === 'Goods' && moves.isPending ? <PageState kind="loading" rows={2} /> : null}
              {moves.data?.items.length === 0 ? (
                <p className="text-body-m text-fg-secondary">{t('noMovements')}</p>
              ) : null}
              {moves.data?.items.map((m) => (
                <StockMovementRow key={m.id} {...presentation.movementView(m, p.baseUnitName)} />
              ))}
              {p.catalogStatus === 'Public' ? <CorrectionStatusRow product={p} /> : null}
            </Section>
          </div>
          <ProductActions product={p} />
          <ProductIdentitySection product={p} />
        </>
      ) : null}
    </PageShell>
  );
}
