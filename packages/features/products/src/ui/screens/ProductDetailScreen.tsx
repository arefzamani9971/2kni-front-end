'use client';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ButtonLink, ListRow, PageShell, PageState, Section, StockMovementRow } from '@dukani/ui-kit';
import { detailRows, movementView } from '../../domain/product';
import { useMovements, useProduct } from '../hooks/use-products';

/** detail (Figma 312:9534, newdetail 312:10745): stock, prices and history of one store product. */
export function ProductDetailScreen({ productId }: { productId: string }) {
  const store = useActiveStore();
  const nav = useNavigation();
  const canStock = useCan('purchase.manage');
  const product = useProduct(productId);
  const moves = useMovements(productId);
  const p = product.data;
  const back = () => nav.push(sellerRoutes.products.list(store.id));

  return (
    <PageShell
      title={p?.title ?? 'کالا'}
      subtitle={`دکانی · ${store.name}`}
      actions={
        <>
          {canStock && p ? (
            <Button block onClick={() => nav.push(`${sellerRoutes.purchases.new(store.id)}?productId=${p.id}`)}>
              افزودن موجودی
            </Button>
          ) : null}
          <Button variant="secondary" block onClick={back}>
            بازگشت
          </Button>
        </>
      }
    >
      {product.isPending ? <PageState kind="loading" rows={3} /> : null}
      {product.error ? <PageState kind={product.error.kind === 'NotFound' ? 'not-found' : 'error'} description={product.error.message} /> : null}
      {p ? (
        <>
          {p.isBelowCost ? <Alert tone="warning" title="قیمت فروش کمتر از بهای خرید است" description="قیمت را بازبینی کنید." /> : null}
          {p.costStatus === 'Unknown' ? (
            <Alert tone="warning" title="بهای این کالا نامعلوم است" description="سود فروش این کالا تا ثبت بها محاسبه نمی‌شود. بهای نامعلوم، صفر نیست." />
          ) : null}
          <Section title="موجودی و قیمت">
            {detailRows(p).map((r) => (
              <ListRow key={r}>{r}</ListRow>
            ))}
            <ListRow>
              کد کالا <bdi>{p.sku}</bdi>
              {p.catalogStatus === 'Private' || p.catalogStatus === 'PendingReview' ? ' · کاتالوگ خصوصی' : ''}
            </ListRow>
          </Section>
          <Section title="سوابق">
            {moves.isPending ? <PageState kind="loading" rows={2} /> : null}
            {moves.data?.items.length === 0 ? <p className="text-body-m text-fg-secondary">هنوز ورود یا خروجی ثبت نشده است.</p> : null}
            {moves.data?.items.map((m) => (
              <StockMovementRow key={m.id} {...movementView(m, p.baseUnitName)} />
            ))}
            <ButtonLink href={`${sellerRoutes.products.detail(store.id, p.id)}/local`}>نام و یادداشت فروشگاه</ButtonLink>
            <ButtonLink href={`/s/${store.id}/catalog/${p.catalogItemId}/correction`}>مشخصات کاتالوگ اشتباه است</ButtonLink>
          </Section>
        </>
      ) : null}
    </PageShell>
  );
}
