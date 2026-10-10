'use client';
import { useState } from 'react';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Button,
  Chip,
  ChipGroup,
  PageState,
  Alert,
  ProductDataRow,
  RecordList,
  SearchField,
} from '@dukani/ui-kit';
import { useAppInfiniteQuery } from '@dukani/data';
import { useCatalogModule } from '../../module';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { CatalogShell } from '../components/CatalogShell';
import { CatalogQueryState } from '../components/CatalogQueryState';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
export function CatalogScreen({
  initialTypeId = '',
  initialQuery = '',
  onSelectItem,
}: {
  initialTypeId?: string;
  initialQuery?: string;
  onSelectItem: (id: string, storeProductId: string | null) => Promise<void>;
}) {
  const t = useCatalogTexts();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const nav = useNavigation();
  const [q, setQ] = useState(initialQuery);
  const [typeId, setTypeId] = useState(initialTypeId);
  const { catalog } = useCatalogModule();
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openError, setOpenError] = useState(false);
  const openItem = async (id: string, storeProductId: string | null) => {
    if (!can || openingId) return;
    setOpeningId(id);
    setOpenError(false);
    try {
      await onSelectItem(id, storeProductId);
    } catch {
      setOpenError(true);
    } finally {
      setOpeningId(null);
    }
  };
  const types = useCatalogQuery(['types'], (port, id, signal) => port.types(id, undefined, signal));
  const items = useAppInfiniteQuery({
    queryKey: ['catalog', store.id, 'items', q, typeId],
    queryFn: ({ cursor, signal }) =>
      catalog.items(store.id, q, typeId || undefined, cursor ?? undefined, signal),
  });
  return (
    <CatalogShell
      title={t('catalog')}
      actions={
        can ? (
          <Button block onClick={() => nav.push(sellerRoutes.entry.method(store.id))}>
            {t('createItem')}
          </Button>
        ) : undefined
      }
    >
      <div className="desktop:rounded-lg desktop:border desktop:border-line desktop:bg-surface desktop:p-6 flex min-w-0 flex-col gap-3">
        <SearchField
          label={t('searchItems')}
          placeholder={t('searchItemHint')}
          value={q}
          onChange={(value) => {
            setQ(value);
            nav.replace(sellerRoutes.catalog.list(store.id, typeId, value));
          }}
        />
        <ChipGroup className="flex-nowrap overflow-x-auto pb-1 *:shrink-0" label={t('searchTypes')}>
          <Chip
            selected={!typeId}
            onClick={() => {
              setTypeId('');
              nav.replace(sellerRoutes.catalog.list(store.id, undefined, q));
            }}
          >
            {t('all')}
          </Chip>
          {(types.data ?? []).map((type) => (
            <Chip
              key={type.id}
              selected={typeId === type.id}
              onClick={() => {
                setTypeId(type.id);
                nav.replace(sellerRoutes.catalog.list(store.id, type.id, q));
              }}
            >
              {type.name}
            </Chip>
          ))}
        </ChipGroup>
        <CatalogQueryState
          pending={false}
          error={types.error}
          retry={() => {
            void types.refetch();
          }}
        />
        <CatalogQueryState
          pending={items.isPending}
          error={items.error}
          retry={() => {
            void items.refetch();
          }}
        />
        {openError ? <Alert tone="danger" title={t('startFailed')} /> : null}
        {!items.isPending && !items.error ? (
          items.items.length ? (
            <RecordList
              label={t('catalog')}
              columns={[t('name'), t('description'), t('publicInfo'), t('actions')]}
              rows={items.items.map((item) => ({
                id: item.id,
                card: (
                  <ProductDataRow
                    title={item.title}
                    subtitle={[item.brandName, item.keyAttributes].filter(Boolean).join(' · ')}
                    meta={t('noPriceStock')}
                    metaTone="warning"
                    onClick={() => {
                      void openItem(item.id, item.myStoreProductId);
                    }}
                  />
                ),
                cells: [
                  item.title,
                  item.keyAttributes ?? item.productTypeName,
                  t(`status.${item.status}`),
                  <Button
                    key={item.id}
                    variant="secondary"
                    loading={openingId === item.id}
                    disabled={!can || !!openingId}
                    onClick={() => {
                      void openItem(item.id, item.myStoreProductId);
                    }}
                  >
                    {t('details')}
                  </Button>,
                ],
              }))}
            />
          ) : (
            <PageState kind="empty" title={t('empty')} />
          )
        ) : null}
        {items.hasNextPage ? (
          <Button block variant="secondary" loading={items.isFetchingNextPage} onClick={items.fetchNextPage}>
            {t('loadMore')}
          </Button>
        ) : null}
      </div>
    </CatalogShell>
  );
}
