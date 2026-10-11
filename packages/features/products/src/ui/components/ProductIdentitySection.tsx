'use client';
import type { Dto } from '@dukani/contracts';
import { Badge, KeyValueList, Section } from '@dukani/ui-kit';
import { isArchived } from '../../domain/lifecycle';
import { useProductTranslations } from '../i18n/use-product-translations';

/** detail (312:9534): effective and catalog names, private note and catalog identity (read-only in F11). */
export function ProductIdentitySection({ product: p }: { product: Dto<'StoreProductDto'> }) {
  const t = useProductTranslations();
  const items = [
    { label: t('identityInfo.storeTitle'), value: p.title, emphasis: true },
    ...(p.localTitle ? [{ label: t('identityInfo.catalogTitle'), value: p.catalogTitle }] : []),
    ...(p.localNote
      ? [{ label: t('identityInfo.note'), value: <span className="whitespace-pre-line">{p.localNote}</span> }]
      : []),
    {
      label: t('identityInfo.type'),
      value: p.kind === 'Service' ? t('identityInfo.service') : p.productTypeName,
    },
    { label: t('identityInfo.brand'), value: p.brandName ?? t('identityInfo.noBrand') },
    { label: t('identityInfo.unit'), value: p.baseUnitName },
    { label: t('sku'), value: <bdi>{p.sku}</bdi> },
  ];
  return (
    <Section
      title={t('identityInfo.title')}
      actions={isArchived(p) ? <Badge tone="warning">{t('lifecycle.archived')}</Badge> : undefined}
    >
      <KeyValueList items={items} />
    </Section>
  );
}
