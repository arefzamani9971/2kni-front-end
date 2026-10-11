'use client';
import { useEffect, useState } from 'react';
import { useAppInfiniteQuery, useAppQuery } from '@dukani/data';
import { useActiveStore, useCan, useDebounced, useOnlineStatus } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Alert,
  Button,
  ListRow,
  PageState,
  SearchAutocomplete,
  Section,
  SelectField,
  Overlay,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import type { EntrySearchFilters } from '../../application/ports';
import { useProductEntryModule } from '../../module';
import { EntryShell } from '../components/EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { CatalogImage } from '../components/CatalogImage';
import { EntrySelectionScreen } from './EntrySelectionScreen';

export function EntrySearchScreen({
  query,
  itemId,
  productId,
  bulk = false,
  filters = {},
}: {
  query: string;
  itemId?: string;
  productId?: string;
  bulk?: boolean;
  filters?: EntrySearchFilters;
}) {
  return itemId || productId ? (
    <EntrySelectionScreen query={query} itemId={itemId} productId={productId} bulk={bulk} filters={filters} />
  ) : (
    <SearchResults query={query} bulk={bulk} filters={filters} />
  );
}
function SearchResults({
  query,
  bulk,
  filters,
}: {
  query: string;
  bulk: boolean;
  filters: EntrySearchFilters;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const message = useAppErrorMessage();
  const store = useActiveStore();
  const online = useOnlineStatus();
  const can = useCan('product.manage');
  const { catalog } = useProductEntryModule();
  const go = useEntryNav();
  const { startNew } = useStartEntry({ bulk });
  const [filterOpen, setFilterOpen] = useState(false);
  const categories = useAppQuery({
    queryKey: ['entry-filters', store.id, 'categories'],
    enabled: filterOpen,
    queryFn: ({ signal }) => catalog.categories(store.id, signal),
  });
  const types = useAppQuery({
    queryKey: ['entry-filters', store.id, 'types'],
    enabled: filterOpen,
    queryFn: ({ signal }) => catalog.productTypes(store.id, signal),
  });
  const brands = useAppQuery({
    queryKey: ['entry-filters', store.id, 'brands'],
    enabled: filterOpen,
    queryFn: ({ signal }) => catalog.brands(store.id, signal),
  });
  const categoryOptions = (nodes: NonNullable<typeof categories.data>): { value: string; label: string }[] =>
    nodes.flatMap((c) => [{ value: c.id, label: c.name }, ...categoryOptions(c.children)]);
  const changeFilters = (next: EntrySearchFilters) =>
    go.nav.replace(sellerRoutes.entry.search(store.id, q, bulk, next));
  const [q, setQ] = useState(query);
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);
  const canonical = useDebounced(q.trim());
  const valid = canonical.length > 0 && canonical.length <= 120;
  const settling = q.trim() !== canonical;
  const local = useAppInfiniteQuery({
    queryKey: ['entry-search', store.id, 'local', canonical],
    enabled: valid && canonical.length <= 100,
    queryFn: ({ cursor, signal }) => catalog.storeProducts(store.id, canonical, cursor ?? undefined, signal),
  });
  const publicItems = useAppInfiniteQuery({
    queryKey: ['entry-search', store.id, 'catalog', canonical, filters],
    enabled: valid,
    queryFn: ({ cursor, signal }) =>
      catalog.catalogItems(store.id, canonical, cursor ?? undefined, signal, filters),
  });
  useEffect(() => {
    if (canonical !== query) go.nav.replace(sellerRoutes.entry.search(store.id, canonical, bulk, filters));
  }, [canonical, query, go.nav, store.id, bulk, filters]);
  const select = (itemId?: string, productId?: string) =>
    go.nav.push(
      sellerRoutes.entry.search(store.id, canonical, bulk, filters) +
        (itemId ? '&item=' + encodeURIComponent(itemId) : '') +
        (productId ? '&product=' + encodeURIComponent(productId) : ''),
    );
  const nothing =
    valid &&
    !settling &&
    publicItems.isSuccess &&
    (canonical.length > 100 || local.isSuccess) &&
    local.items.length === 0 &&
    publicItems.items.length === 0;
  const create = async () => {
    if (starting || !can) return;
    setStarting(true);
    setFailed(false);
    try {
      await startNew({ title: canonical });
    } catch {
      setFailed(true);
      setStarting(false);
    }
  };
  return (
    <EntryShell
      title={t('searchResults')}
      back={go.method}
      breadcrumb={t('catalogBreadcrumb')}
      actions={
        <Button variant="secondary" block onClick={go.method}>
          {t('back')}
        </Button>
      }
    >
      {!online ? <Alert tone="warning" title={t('bulk.offline')} /> : null}
      <Overlay
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title={t('searchFilters')}
        actions={<Button onClick={() => setFilterOpen(false)}>{t('back')}</Button>}
      >
        {categories.error || types.error || brands.error ? <Alert tone="danger" title={t('retry')} /> : null}
        <SelectField
          label={t('categoryFilter')}
          optional
          value={filters.categoryId ?? ''}
          options={categoryOptions(categories.data ?? [])}
          onChange={(categoryId) => changeFilters({ ...filters, categoryId })}
        />
        <SelectField
          label={t('productType')}
          optional
          value={filters.productTypeId ?? ''}
          options={(types.data ?? []).map((v) => ({ value: v.id, label: v.name }))}
          onChange={(productTypeId) => changeFilters({ ...filters, productTypeId })}
        />
        <SelectField
          label={t('brand')}
          optional
          value={filters.brandId ?? ''}
          options={(brands.data ?? []).map((v) => ({ value: v.id, label: v.name }))}
          onChange={(brandId) => changeFilters({ ...filters, brandId })}
        />
        <Button variant="secondary" onClick={() => changeFilters({})}>
          {t('clearFilters')}
        </Button>
      </Overlay>
      <Section title={t('findCatalog')} className="desktop:p-6">
        <SearchAutocomplete
          suggestions={
            settling
              ? []
              : [
                  ...local.items.slice(0, 3).map((item) => ({
                    id: 'local:' + item.id,
                    label: item.title,
                    description: [item.productTypeName, item.brandName].filter(Boolean).join(' · '),
                  })),
                  ...publicItems.items.slice(0, 3).map((item) => ({
                    id: 'catalog:' + item.id,
                    label: item.title,
                    description: [item.productTypeName, item.brandName, item.keyAttributes]
                      .filter(Boolean)
                      .join(' · '),
                  })),
                ]
          }
          onSelect={(id) => (id.startsWith('local:') ? select(undefined, id.slice(6)) : select(id.slice(8)))}
          label={t('nameBarcodeSearch')}
          value={q}
          onChange={setQ}
          status={q.trim().length > 120 ? 'error' : 'default'}
          message={q.trim().length > 120 ? t('searchTooLong') : undefined}
        />
        <p className="text-body-s text-fg-tertiary">{t('liveResults')}</p>
        <Button variant="secondary" onClick={() => setFilterOpen(true)}>
          {t('searchFilters')}
        </Button>
      </Section>
      {failed ? <Alert tone="danger" title={t('startFailed')} /> : null}
      {!valid && canonical.length === 0 ? <PageState kind="empty" title={t('searchPrompt')} /> : null}
      {settling ? (
        <PageState kind="loading" rows={3} />
      ) : valid ? (
        <div className="desktop:grid-cols-3 desktop:gap-6 grid gap-4">
          <Section title={t('inStore')} className="desktop:p-6">
            {canonical.length > 100 ? <Alert title={t('localSearchTooLong')} /> : null}
            {canonical.length <= 100 && local.isLoading ? <PageState kind="loading" rows={2} /> : null}
            {local.error ? (
              <PageState
                kind="error"
                description={message(local.error)}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void (local.items.length && local.hasNextPage
                        ? local.fetchNextPage()
                        : local.refetch());
                    }}
                  >
                    {t('retry')}
                  </Button>
                }
              />
            ) : null}
            {local.items.map((item) => (
              <div key={item.id} className="border-line flex flex-col gap-3 border-b pb-3">
                <ListRow>{item.title}</ListRow>
                <p className="text-body-s text-fg-secondary">
                  {[item.productTypeName, item.brandName].filter(Boolean).join(' · ')}
                </p>
                <p className="text-body-s text-fg-secondary">
                  {t('onHandQty', { quantity: presentation.qty(item.onHand), unit: item.baseUnitName })}
                </p>
                <Button
                  block
                  variant="secondary"
                  className="desktop:bg-action desktop:text-fg-inverse desktop:actionable:hover:bg-action-hover desktop:disabled:bg-action-primary-disabled"
                  onClick={() => select(undefined, item.id)}
                >
                  {t('addExistingStock')}
                </Button>
              </div>
            ))}
            {local.isSuccess && !local.items.length ? (
              <p className="text-body-m text-fg-secondary">{t('noLocalResults')}</p>
            ) : null}
            {local.hasNextPage ? (
              <Button variant="secondary" loading={local.isFetchingNextPage} onClick={local.fetchNextPage}>
                {t('loadMore')}
              </Button>
            ) : null}
          </Section>
          <Section title={t('publicCatalog')} className="desktop:p-6">
            {publicItems.isLoading ? <PageState kind="loading" rows={2} /> : null}
            {publicItems.error ? (
              <PageState
                kind="error"
                description={message(publicItems.error)}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void (publicItems.items.length && publicItems.hasNextPage
                        ? publicItems.fetchNextPage()
                        : publicItems.refetch());
                    }}
                  >
                    {t('retry')}
                  </Button>
                }
              />
            ) : null}
            {publicItems.items.map((item) => (
              <div key={item.id} className="border-line flex flex-col gap-3 border-b pb-3">
                <div className="flex items-center gap-2">
                  <CatalogImage itemId={item.id} fileId={item.primaryImageFileId} title={item.title} />
                  <span>{item.title}</span>
                </div>
                <p className="text-body-s text-fg-secondary">
                  {[item.productTypeName, item.brandName, item.keyAttributes, item.baseUnitName]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="text-body-s text-fg-tertiary">{t(`catalogStatus.${item.status}`)}</p>
                <Button block variant="secondary" onClick={() => select(item.id)}>
                  {t('chooseCatalog')}
                </Button>
              </div>
            ))}
            {publicItems.isSuccess && !publicItems.items.length ? (
              <p className="text-body-m text-fg-secondary">{t('noCatalogResults')}</p>
            ) : null}
            {publicItems.hasNextPage ? (
              <Button
                variant="secondary"
                loading={publicItems.isFetchingNextPage}
                onClick={publicItems.fetchNextPage}
              >
                {t('loadMore')}
              </Button>
            ) : null}
          </Section>
          {can ? (
            <Section title={nothing ? t('nothingFound') : t('notFoundQuestion')} className="desktop:p-6">
              <Button
                variant="secondary"
                block
                className="desktop:bg-action desktop:text-fg-inverse desktop:actionable:hover:bg-action-hover desktop:disabled:bg-action-primary-disabled"
                loading={starting}
                onClick={() => {
                  void create();
                }}
              >
                {t('newStoreProduct')}
              </Button>
            </Section>
          ) : null}
        </div>
      ) : null}
    </EntryShell>
  );
}
