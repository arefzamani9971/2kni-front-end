'use client';
import { useContext } from 'react';
import { Button } from '@dukani/ui-kit';
import type { CatalogItemSummary } from '../../domain/catalog.types';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CatalogItemOpeningContext } from './catalog-item-opening-context';

/** «جزئیات کاتالوگ» of one row: busy on the row being opened, disabled on the others meanwhile. */
export function CatalogItemAction({ item }: { item: CatalogItemSummary }) {
  const t = useCatalogTexts();
  const opening = useContext(CatalogItemOpeningContext);
  if (!opening) return null;
  return (
    <Button
      variant="secondary"
      loading={opening.openingId === item.id}
      disabled={!!opening.openingId}
      onClick={() => opening.open(item)}
    >
      {t('details')}
    </Button>
  );
}
