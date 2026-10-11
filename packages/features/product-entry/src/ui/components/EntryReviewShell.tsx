'use client';
import type { ReactNode } from 'react';
import type { Money } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { ListRow, PageShell, ReviewScene, Section } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { baseUnitNameOf, kindOf, titleOf } from '../../domain/entry-draft';
import { EntryWorkflow } from './EntryWorkflow';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
/** Mobile review page and desktop confirmation dialog share one form state. */
export function EntryReviewShell({
  title,
  actions,
  children,
  onBack,
  locked = false,
  draft,
  salePrice,
}: {
  title: ReactNode;
  actions: ReactNode;
  children: ReactNode;
  onBack: () => void;
  locked?: boolean;
  draft: EntryDraft;
  salePrice: Money | null;
}) {
  const store = useActiveStore();
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  return (
    <PageShell
      title={
        <>
          <span className="desktop:hidden">{title}</span>
          <span className="desktop:inline hidden">{t('salePrice')}</span>
        </>
      }
      subtitle={t('storeSubtitle', { name: store.name })}
      actions={actions}
      actionsClassName="desktop:hidden"
    >
      <div className="desktop:flex hidden flex-col gap-6" aria-hidden="true" inert>
        {kindOf(draft) === 'Goods' ? <EntryWorkflow current={2} /> : null}
        <div className="grid grid-cols-3 gap-6">
          <Section title={t('singlePackSales')} className="col-span-2">
            <ListRow>{titleOf(draft)}</ListRow>
            <ListRow>{t('pricePer', { unit: baseUnitNameOf(draft) })}</ListRow>
            <ListRow>{salePrice ? presentation.money(salePrice) : t('priceNotSet')}</ListRow>
          </Section>
          <Section title={t('pricingHelp')}>
            <ListRow>{t('markupMarginHint')}</ListRow>
          </Section>
        </div>
      </div>
      <ReviewScene
        open
        title={title}
        onOpenChange={(open) => {
          if (!open && !locked) onBack();
        }}
        actions={actions}
      >
        {children}
      </ReviewScene>
    </PageShell>
  );
}
