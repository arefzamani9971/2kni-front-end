'use client';
import type { Dto } from '@dukani/contracts';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Badge, ButtonLink, ListRow } from '@dukani/ui-kit';
import { useItemCorrections } from '../hooks/use-item-corrections';
import { useProductTranslations } from '../i18n/use-product-translations';
import { CORRECTION_TONE } from './CorrectionStatusRow.constants';

/** Latest catalog correction of the product's item, inside «سوابق» (F11 §7); nothing when there is none. */
export function CorrectionStatusRow({ product }: { product: Dto<'StoreProductDto'> }) {
  const t = useProductTranslations();
  const store = useActiveStore();
  const corrections = useItemCorrections(product.catalogItemId);
  const latest = corrections.data?.[0];
  if (!latest) return null;
  return (
    <ListRow
      trailing={
        <ButtonLink block={false} size="sm" href={sellerRoutes.catalog.correctionDetail(store.id, latest.id)}>
          {t('corrections.view')}
        </ButtonLink>
      }
    >
      <span className="flex items-center gap-2">
        {t('corrections.latest')}
        <Badge tone={CORRECTION_TONE[latest.status]}>{t(`corrections.statuses.${latest.status}`)}</Badge>
      </span>
    </ListRow>
  );
}
