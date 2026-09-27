'use client';
import { decimal, formatDecimalFa, formatMoney, fromApiMoney } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, ListRow, PageState, Section } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../module';
import { BackButton, EntryShell, MissingDraft } from '../components/EntryShell';
import { useEntryDraft, useEntryNav } from '../hooks/use-entry';

/** success (Figma 312:9475): ready in the store + next steps. The draft is removed when leaving. */
export function EntryDoneScreen({ draftId }: { draftId: string }) {
  const { draft, loading, missing } = useEntryDraft(draftId);
  const { drafts } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();
  if (missing) return <MissingDraft onRestart={go.method} />;
  const r = draft?.result;
  if (loading || !r)
    return (
      <EntryShell title="کالا ثبت شد">
        <PageState kind="loading" />
      </EntryShell>
    );
  const leave = async (to: () => void) => {
    await drafts.remove(store.id, draftId);
    to();
  };
  return (
    <EntryShell
      title="کالا ثبت شد"
      actions={
        <>
          <Button block onClick={() => leave(go.method)}>
            ثبت کالای بعدی
          </Button>
          <BackButton onClick={() => leave(go.home)} />
        </>
      }
    >
      <Section title="آمادهٔ استفاده در فروشگاه">
        <ListRow>{r.title}</ListRow>
        <ListRow>
          {r.purchaseId ? `${formatDecimalFa(decimal.of(r.onHand))} ${r.baseUnitName} موجودی ثبت شد.` : 'کالا بدون موجودی ثبت شد.'}
          {' · کد کالا '}
          <bdi>{r.sku}</bdi>
        </ListRow>
        {r.salePriceRials != null ? <ListRow>قیمت فروش هر {r.baseUnitName}: {formatMoney(fromApiMoney(r.salePriceRials)!)}</ListRow> : null}
        {r.catalogItemCreated ? (
          <>
            <ListRow>وضعیت کاتالوگ: خصوصی · در انتظار بررسی ادمین</ListRow>
            <ListRow>عمومی‌شدن پس از تأیید است.</ListRow>
          </>
        ) : null}
      </Section>
      <Section title="گام بعد">
        <ButtonLink href={sellerRoutes.sales.new(store.id)}>ثبت اولین فروش</ButtonLink>
        <ButtonLink href={sellerRoutes.products.detail(store.id, r.storeProductId)}>مشاهدهٔ کالا</ButtonLink>
        <ButtonLink href={sellerRoutes.purchases.new(store.id)}>ثبت خرید کالا</ButtonLink>
      </Section>
    </EntryShell>
  );
}
