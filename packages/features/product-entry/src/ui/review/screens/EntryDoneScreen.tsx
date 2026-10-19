'use client';
import { useEntryPresentation } from '../../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../../i18n/use-entry-translations';

import { fromApiMoney } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, ListRow, PageState, Section } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../../module';
import { BackButton } from '../../common/components/BackButton';
import { EntryShell } from '../../common/components/EntryShell';
import { EntryReviewShell } from '../components/EntryReviewShell';
import { MissingDraft } from '../../common/components/MissingDraft';
import { useEntryDraft } from '../../common/hooks/use-entry-draft';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import { StandaloneResult } from '../components/StandaloneResult';

/** success (Figma 312:9475): ready in the store + next steps. The draft is removed when leaving. */
export function EntryDoneScreen({ draftId }: { draftId: string }) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();

  const { draft, loading, error, missing } = useEntryDraft(draftId);
  const { drafts } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();
  if (error) return <PageState kind="error" />;
  if (missing) return <MissingDraft onRestart={go.method} />;
  const r = draft?.result;
  if (loading || !r)
    return (
      <EntryShell title={t('productSaved')}>
        <PageState kind="loading" />
      </EntryShell>
    );
  if (draft?.intent === 'standalone') return <StandaloneResult draft={draft} />;
  const leave = async (to: () => void) => {
    await drafts.remove(store.id, draftId);
    to();
  };
  return (
    <EntryReviewShell
      draft={draft!}
      salePrice={r.salePriceAmount != null ? fromApiMoney(r.salePriceAmount) : null}
      onBack={() => void leave(go.home)}
      title={t('productSaved')}
      actions={
        <>
          <Button block onClick={() => leave(go.method)}>
            {t('nextProduct')}
          </Button>
          <BackButton onClick={() => leave(go.home)} />
        </>
      }
    >
      <Section title={t('productSaved')}>
        <ListRow>{r.title}</ListRow>
        <ListRow>
          {r.itemKind === 'Service'
            ? t('serviceHint')
            : r.purchaseId
              ? t('stockSaved', { quantity: presentation.qty(r.onHand), unit: r.baseUnitName })
              : t('savedWithoutStock')}{' '}
          {t('sku')} <bdi>{r.sku}</bdi>
        </ListRow>
        {r.salePriceAmount != null ? (
          <ListRow>
            {t('salePer', {
              unit: r.baseUnitName,
              amount: presentation.money(fromApiMoney(r.salePriceAmount)!),
            })}
          </ListRow>
        ) : null}
        {r.catalogStatus !== 'Public' ? (
          <>
            <ListRow>{t(`catalogStatus.${r.catalogStatus}`)}</ListRow>
            {r.itemKind !== 'Service' ? <ListRow>{t('publicAfterApproval')}</ListRow> : null}
          </>
        ) : null}
      </Section>
      <Section title={t('nextStep')}>
        {r.salePriceAmount != null && r.storeProductStatus === 'Active' ? (
          <ButtonLink href={sellerRoutes.sales.new(store.id)}>{t('firstSale')}</ButtonLink>
        ) : null}
        <ButtonLink href={sellerRoutes.products.detail(store.id, r.storeProductId)}>
          {t('viewProduct')}
        </ButtonLink>
        {r.itemKind !== 'Service' ? (
          <ButtonLink href={sellerRoutes.purchases.new(store.id)}>{t('purchaseProduct')}</ButtonLink>
        ) : null}
      </Section>
    </EntryReviewShell>
  );
}
