'use client';
import { BarcodeField, ButtonLink, Checkbox, RecordList, SelectField } from '@dukani/ui-kit';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useAttachmentTranslations } from '../i18n/use-attachment-translations';
import type { AttachmentRecordsProps } from './AttachmentRecords.types';

/** CPB-D 1255:52 / CPB-M 1255:132: one selection model, editable table on desktop and touch cards on mobile. */
export function AttachmentRecords({
  candidates,
  selections,
  disabled,
  onSelect,
  onChange,
}: AttachmentRecordsProps) {
  const t = useAttachmentTranslations();
  const store = useActiveStore();
  return (
    <RecordList
      label={t('title')}
      columns={[t('name'), t('original'), t('unit'), t('membership'), t('local')]}
      rows={candidates.map((candidate) => {
        const { item, units } = candidate;
        const selected = selections.find((entry) => entry.row.catalogItemId === item.id);
        const unit =
          units.find((entry) => entry.id === selected?.row.catalogItemUnitId) ??
          units.find((entry) => entry.kind === 'Base') ??
          units[0];
        const title = (
          <Checkbox
            label={item.title}
            description={[item.productTypeName, item.keyAttributes].filter(Boolean).join(' · ')}
            checked={!!selected}
            disabled={disabled || !units.length}
            onChange={(checked) => onSelect(candidate, checked)}
          />
        );
        const codes = (
          <span className="text-body-s break-all" dir="ltr">
            {unit?.barcodes.map((code) => code.code).join(' · ') || t('noCode')}
          </span>
        );
        const unitField = (
          <SelectField
            label={t('unit')}
            classNames={{ label: 'desktop:sr-only', root: 'min-w-24' }}
            value={unit?.id}
            options={units.map((entry) => ({ value: entry.id, label: entry.name }))}
            disabled={disabled || !selected}
            onChange={(catalogItemUnitId) => onChange(item.id, { catalogItemUnitId })}
          />
        );
        const membership = t(item.myStoreProductId ? 'member' : 'available');
        const alias = item.myStoreProductId ? (
          <ButtonLink href={sellerRoutes.products.barcodeAlias(store.id, item.myStoreProductId)}>
            {t('alias')}
          </ButtonLink>
        ) : (
          <BarcodeField
            label={t('local')}
            placeholder={t('barcodePlaceholder')}
            classNames={{ label: 'desktop:sr-only' }}
            optional
            disabled={disabled || !selected}
            value={selected?.row.localBarcode ?? ''}
            onChange={(localBarcode) => onChange(item.id, { localBarcode })}
            maxLength={32}
          />
        );
        return {
          id: item.id,
          cells: [title, codes, unitField, membership, alias],
          card: (
            <section className="bg-surface border-line flex flex-col gap-3 rounded-md border p-4">
              {title}
              <div className="text-body-s text-fg-secondary">
                {t('original')}: {codes}
              </div>
              <p className="text-body-s text-fg-secondary">{membership}</p>
              {unitField}
              {alias}
            </section>
          ),
        };
      })}
    />
  );
}
