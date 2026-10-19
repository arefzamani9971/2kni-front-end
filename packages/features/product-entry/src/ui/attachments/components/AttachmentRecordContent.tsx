'use client';
import { memo } from 'react';
import { BarcodeField, ButtonLink, SelectField } from '@dukani/ui-kit';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import type { AttachmentRecordContentProps } from '../types/AttachmentRecordContent.types';

/** Memoization is per row/field, so changing one selection leaves the other inputs untouched. */
export const AttachmentRecordContent = memo(function AttachmentRecordContent({
  candidate,
  selected,
  disabled,
  onChange,
  part,
}: AttachmentRecordContentProps) {
  const t = useAttachmentTranslations();
  const store = useActiveStore();
  const { item, units } = candidate;
  const unit =
    units.find((entry) => entry.id === selected?.row.catalogItemUnitId) ??
    units.find((entry) => entry.kind === 'Base') ??
    units[0];
  const title = (
    <div>
      <p className="text-label-m font-semibold">{item.title}</p>
      <p className="text-body-s text-fg-secondary">
        {[item.productTypeName, item.keyAttributes].filter(Boolean).join(' · ')}
      </p>
    </div>
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

  if (part === 'title') return title;
  if (part === 'codes') return codes;
  if (part === 'unit') return unitField;
  if (part === 'membership') return membership;
  if (part === 'alias') return alias;
  return (
    <section className="bg-surface border-line flex flex-col gap-3 rounded-md border p-4">
      {title}
      <div className="text-body-s text-fg-secondary">
        {t('original')}: {codes}
      </div>
      <p className="text-body-s text-fg-secondary">{membership}</p>
      {unitField}
      {alias}
    </section>
  );
});
