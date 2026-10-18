'use client';
import type { Dto } from '@dukani/contracts';
import { ListRow, Section } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { CatalogImage } from './CatalogImage';

/** The chosen catalog item, read-only: type and brand, status, images, content, attributes and units with codes. */
export function CatalogItemSummary({ item }: { item: Dto<'CatalogItemDto'> }) {
  const t = useEntryTranslations();
  return (
    <Section title={item.title} className="desktop:p-6">
      <ListRow>{[item.productType.name, item.brand?.name].filter(Boolean).join(' · ')}</ListRow>
      <ListRow>{t(`catalogStatus.${item.status}`)}</ListRow>
      {item.images.map((image) => (
        <CatalogImage key={image.fileId} itemId={item.id} fileId={image.fileId} title={item.title} />
      ))}
      {item.netContentValue ? (
        <ListRow>
          {item.netContentValue} {item.netContentUnit?.name}
        </ListRow>
      ) : null}
      {item.description ? <ListRow>{item.description}</ListRow> : null}
      {item.attributes.map((a) => (
        <ListRow key={a.attributeId}>
          {a.name}:{' '}
          {a.text ??
            a.number ??
            (a.bool == null ? a.options.map((o) => o.value).join(' · ') : t(a.bool ? 'yes' : 'no'))}
          {a.isObsolete ? ' · ' + t('obsoleteValue') : ''}
        </ListRow>
      ))}
      {item.units.map((unit) => (
        <ListRow key={unit.id}>
          <span>
            {unit.name} · {unit.baseQty} {item.baseUnit.name}
          </span>
          <span dir="ltr">{unit.barcodes.map((b) => b.code).join(' · ')}</span>
        </ListRow>
      ))}
    </Section>
  );
}
