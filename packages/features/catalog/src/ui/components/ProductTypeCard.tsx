import { RecordCard } from '@dukani/ui-kit';
import type { CatalogTypeSummary } from '../../domain/catalog.types';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
export function ProductTypeCard({ type, href }: { type: CatalogTypeSummary; href: string }) {
  const t = useCatalogTexts();
  const detail = useCatalogQuery(['type', type.id], (port, id, signal) => port.type(id, type.id, signal));
  return (
    <RecordCard
      title={type.name}
      subtitle={t('productType')}
      description={detail.data?.attributes.map((a) => a.name).join(' · ') || t(`status.${type.status}`)}
      href={href}
    />
  );
}
