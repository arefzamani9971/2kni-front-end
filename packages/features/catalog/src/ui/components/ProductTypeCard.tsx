import { RecordCard } from '@dukani/ui-kit';
import type { CatalogTypeSummary } from '../../domain/catalog.types';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
/** Public types carry the Figma «نوع کالا» badge; the seller's own types show their review status instead. */
export function ProductTypeCard({ type, href }: { type: CatalogTypeSummary; href: string }) {
  const t = useCatalogTexts();
  return (
    <RecordCard
      title={type.name}
      subtitle={type.status === 'Public' ? t('productType') : t(`status.${type.status}`)}
      description={type.attributeNames.join(' · ') || t('noAttributes')}
      href={href}
    />
  );
}
