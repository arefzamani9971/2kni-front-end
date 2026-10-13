import { RecordList } from '@dukani/ui-kit';
import { useProductTranslations } from '../i18n/use-product-translations';

/** CPB alias: desktop summary row, mobile identity card. */
export function BarcodeAliasSummary({
  title,
  unitName,
  baseQty,
}: {
  title: string;
  unitName: string;
  baseQty: string;
}) {
  const t = useProductTranslations();
  const detail = t('alias.unitSummary', { unit: unitName, quantity: baseQty });
  return (
    <RecordList
      label={t('alias.title')}
      columns={[t('product'), t('alias.information')]}
      rows={[
        {
          id: 'unit',
          cells: [title, detail],
          card: (
            <section className="bg-surface border-line flex flex-col gap-2 rounded-md border p-4">
              <h2 className="text-label-m text-fg-primary">{title}</h2>
              <p className="text-body-s text-fg-secondary">{detail}</p>
            </section>
          ),
        },
      ]}
    />
  );
}
