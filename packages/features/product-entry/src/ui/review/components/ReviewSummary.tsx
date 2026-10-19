'use client';
import type { Dto } from '@dukani/contracts';
import { fromApiMoney } from '@dukani/domain';
import { ListRow, Section } from '@dukani/ui-kit';
import { kindOf } from '../../../domain/entry-draft';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { useEntryPresentation } from '../../i18n/use-entry-presentation';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { createCostLabels } from '../constants/Review.constants';

/** «کالای فروشگاه» and «موجودی و قیمت» cards of the review step, from the server preview. */
export function ReviewSummary({ draft, preview }: { draft: EntryDraft; preview: Dto<'RegisterPreviewDto'> }) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const item = draft.newItem;
  const sale =
    preview.salePriceAmount != null ? presentation.money(fromApiMoney(preview.salePriceAmount)!) : null;
  const typeName = item?.productTypeName ?? draft.catalog?.typeName;
  const brandName = item?.brandName ?? draft.catalog?.brandName;
  return (
    <div className="desktop:grid-cols-2 grid gap-4">
      <Section title={t('storeProduct')} className="desktop:bg-muted desktop:border-0">
        <ListRow>{preview.title}</ListRow>
        <ListRow>
          {[
            typeName ? t('typeNamed', { name: typeName }) : null,
            brandName ? t('brandNamed', { name: brandName }) : null,
            t('unitNamed', { name: preview.baseUnitName }),
          ]
            .filter(Boolean)
            .join(' · ')}
        </ListRow>
      </Section>
      <Section title={t('stockPrice')} className="desktop:bg-muted desktop:border-0">
        <ListRow>
          {kindOf(draft) === 'Service' ? t('serviceHint') : (preview.conversionText ?? t('noStockHint'))}
        </ListRow>
        {draft.intent !== 'standalone' && draft.stock ? (
          <ListRow>
            {t('initialCost')}
            {createCostLabels(t)[preview.costStatus]}
            {preview.costPerBaseAmount != null
              ? t('costPer', {
                  unit: preview.baseUnitName,
                  amount: presentation.money(fromApiMoney(preview.costPerBaseAmount)!),
                })
              : ''}
          </ListRow>
        ) : null}
        <ListRow>
          {draft.intent === 'standalone'
            ? t('standaloneUnchanged')
            : sale
              ? t('salePer', { unit: preview.baseUnitName, amount: sale })
              : t('priceNotSet')}
        </ListRow>
      </Section>
    </div>
  );
}
