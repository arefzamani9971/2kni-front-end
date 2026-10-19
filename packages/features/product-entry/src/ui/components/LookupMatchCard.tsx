'use client';
import type { Dto } from '@dukani/contracts';
import { fromApiMoney } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ButtonLink, ListRow, Section } from '@dukani/ui-kit';
import { isInactiveMatch } from '../../domain/bulk-scan';
import { useEntryPresentation } from '../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** One barcode match (F09): unit and factor, stock, price, status, and the explicit choose/correct actions. */
export function LookupMatchCard({
  match,
  conflict,
  canManage,
  busy,
  loading,
  onSelect,
  onCorrect,
}: {
  match: Dto<'BarcodeMatchDto'>;
  conflict: boolean;
  canManage: boolean;
  busy: boolean;
  loading: boolean;
  onSelect: () => void;
  onCorrect: () => void;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const store = useActiveStore();
  const inactive = isInactiveMatch(match);
  return (
    <Section title={match.title} className="desktop:p-6">
      <ListRow>
        {match.unitName} · {presentation.qty(match.baseQty)}
      </ListRow>
      {match.itemKind !== 'Service' ? (
        <ListRow>
          {t('lookup.available')}:{' '}
          {match.available != null ? presentation.qty(match.available) : t('lookup.unknownValue')}
        </ListRow>
      ) : null}
      <ListRow>
        {t('lookup.price')}:{' '}
        {match.unitPriceAmount != null
          ? presentation.money(fromApiMoney(match.unitPriceAmount)!)
          : t('lookup.noPrice')}
      </ListRow>
      <ListRow>{t(`catalogStatus.${match.catalogStatus}`)}</ListRow>
      {inactive ? (
        <>
          <Alert tone="warning" title={t('lookup.inactive')} />
          {match.storeProductId ? (
            <ButtonLink href={sellerRoutes.products.detail(store.id, match.storeProductId)}>
              {t('viewProduct')}
            </ButtonLink>
          ) : null}
        </>
      ) : null}
      {conflict && canManage && match.catalogStatus === 'Public' ? (
        <Button block variant="secondary" onClick={onCorrect}>
          {t('correction.sameItem')}
        </Button>
      ) : null}
      <Button
        block
        variant="secondary"
        loading={loading}
        disabled={!canManage || busy || inactive}
        onClick={onSelect}
      >
        {t(match.storeProductId ? 'addExistingStock' : 'chooseCatalog')}
      </Button>
    </Section>
  );
}
