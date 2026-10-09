'use client';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { fromApiMoney } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, ListRow, PageState, Section } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../module';
import { BackButton } from '../components/BackButton';
import { EntryShell } from '../components/EntryShell';
import { MissingDraft } from '../components/MissingDraft';
import { useEntryDraft } from '../hooks/use-entry-draft';
import { useEntryNav } from '../hooks/use-entry-nav';

/** success (Figma 312:9475): ready in the store + next steps. The draft is removed when leaving. */
export function EntryDoneScreen({ draftId }: { draftId: string }) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();

  const { draft, loading, missing } = useEntryDraft(draftId);
  const { drafts } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();
  if (missing) return <MissingDraft onRestart={go.method} />;
  const r = draft?.result;
  if (loading || !r)
    return (
      <EntryShell title={t('productSaved')}>
        <PageState kind="loading" />
      </EntryShell>
    );
  const leave = async (to: () => void) => {
    await drafts.remove(store.id, draftId);
    to();
  };
  return (
    <EntryShell
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
      <Section title={t('ready')}>
        <ListRow>{r.title}</ListRow>
        <ListRow>
          {r.purchaseId
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
        {r.catalogItemCreated ? (
          <>
            <ListRow>{t('privateStatus')}</ListRow>
            <ListRow>{t('publicAfterApproval')}</ListRow>
          </>
        ) : null}
      </Section>
      <Section title={t('nextStep')}>
        <ButtonLink href={sellerRoutes.sales.new(store.id)}>{t('firstSale')}</ButtonLink>
        <ButtonLink href={sellerRoutes.products.detail(store.id, r.storeProductId)}>
          {t('viewProduct')}
        </ButtonLink>
        <ButtonLink href={sellerRoutes.purchases.new(store.id)}>{t('purchaseProduct')}</ButtonLink>
      </Section>
    </EntryShell>
  );
}
