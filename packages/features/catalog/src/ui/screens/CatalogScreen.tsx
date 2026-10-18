'use client';
import { useEffect, useState } from 'react';
import { fromListViewParams, toListViewParams, type ListViewParams } from '@dukani/domain';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ButtonLink } from '@dukani/ui-kit';
import { catalogListFilter } from '../../domain/catalog-list';
import { CATALOG_LIST_SORT } from '../../domain/catalog-list.constants';
import type { CatalogItemSort } from '../../domain/catalog.types';
import { useCatalogItemOpening } from '../hooks/use-catalog-item-opening';
import { useCatalogList } from '../hooks/use-catalog-list';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { CatalogItemGrid } from '../components/CatalogItemGrid';
import { CatalogItemOpeningContext } from '../components/catalog-item-opening-context';
import { CatalogListSearch } from '../components/CatalogListSearch';
import { CatalogShell } from '../components/CatalogShell';
import { CatalogQueryState } from '../components/CatalogQueryState';
import { useCatalogTexts } from '../i18n/use-catalog-translations';

/**
 * Catalog list CAT-13 (F07): `useAppList` + `DataGrid` on `POST …/catalog/items/search`. The address keeps the
 * applied search and type and the desktop page, size and sort (PAT-LIST-02 return context), so reload and Back from
 * an item return to them; typing never reaches the URL or the server.
 */
export function CatalogScreen({
  initialTypeId = '',
  initialQuery = '',
  initialView = {},
  onSelectItem,
}: {
  initialTypeId?: string;
  initialQuery?: string;
  initialView?: ListViewParams;
  onSelectItem: (id: string, storeProductId: string | null) => Promise<void>;
}) {
  const t = useCatalogTexts();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const nav = useNavigation();
  const [initial] = useState(() => ({
    filter: catalogListFilter(initialQuery, initialTypeId),
    view: fromListViewParams<CatalogItemSort>(initialView, ['title'], CATALOG_LIST_SORT),
  }));
  const list = useCatalogList(initial.filter, initial.view);
  const { filter, page, pageSize, sort } = list.query;
  const address = sellerRoutes.catalog.list(
    store.id,
    filter.productTypeId ?? undefined,
    filter.q || undefined,
    toListViewParams({ page, pageSize, sort }, CATALOG_LIST_SORT),
  );
  // the address follows the applied view (an invalid value read from it is written back normalized)
  useEffect(() => nav.replaceUrl(address), [nav, address]);
  const opening = useCatalogItemOpening(onSelectItem);
  const types = useCatalogQuery(['types'], (port, id, signal) => port.types(id, undefined, signal));
  return (
    <CatalogShell
      title={t('catalog')}
      actions={
        can ? (
          <>
            <Button block onClick={() => nav.push(sellerRoutes.entry.method(store.id))}>
              {t('createItem')}
            </Button>
            <ButtonLink href={sellerRoutes.entry.catalog(store.id)}>{t('attachCatalog')}</ButtonLink>
          </>
        ) : undefined
      }
    >
      <div className="desktop:rounded-lg desktop:border desktop:border-line desktop:bg-surface desktop:p-6 flex min-w-0 flex-col gap-3">
        <CatalogListSearch applied={filter} onApply={list.applyFilter} types={types.data} />
        <CatalogQueryState
          pending={false}
          error={types.error}
          retry={() => {
            void types.refetch();
          }}
        />
        {opening.failed ? <Alert tone="danger" title={t('startFailed')} /> : null}
        <CatalogItemOpeningContext.Provider value={opening}>
          <CatalogItemGrid source={list} actions={can} />
        </CatalogItemOpeningContext.Provider>
      </div>
    </CatalogShell>
  );
}
