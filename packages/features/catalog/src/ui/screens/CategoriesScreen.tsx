'use client';
import { useEffect, useRef, useState } from 'react';
import { useActiveStore, useCan, useDebounced, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, SearchField, ProductDataRow, Section, PageState, Badge } from '@dukani/ui-kit';
import type { CatalogTypeSummary } from '../../domain/catalog.types';
import { categoryPaths, flattenCategories } from '../../domain/categories';
import { ProductTypeCard } from '../components/ProductTypeCard';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { CatalogShell } from '../components/CatalogShell';
import { CatalogQueryState } from '../components/CatalogQueryState';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
export function CategoriesScreen({ initialQuery = '' }: { initialQuery?: string }) {
  const t = useCatalogTexts();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const nav = useNavigation();
  const [q, setQ] = useState(initialQuery);
  const query = useDebounced(q.trim());
  const cats = useCatalogQuery(['categories'], (port, id, signal) => port.categories(id, signal));
  const types = useCatalogQuery(['types', query], (port, id, signal) => port.types(id, query, signal));
  // the URL follows the settled query only, never each keystroke
  const inUrl = useRef(initialQuery.trim());
  useEffect(() => {
    if (query === inUrl.current) return;
    inUrl.current = query;
    nav.replace(sellerRoutes.catalog.categories(store.id, query));
  }, [query, nav, store.id]);
  const categories = flattenCategories(cats.data ?? []);
  const paths = categoryPaths(cats.data ?? []);
  const typesOf = (categoryId: string) => (types.data ?? []).filter((type) => type.categoryId === categoryId);
  // a type whose group is outside this store's suggested tree still has a group: show it under that name
  const outsideTree = (types.data ?? []).filter((type) => type.categoryId && !paths.has(type.categoryId));
  const outsideGroups = [
    ...new Map(outsideTree.map((type) => [type.categoryId!, type.categoryName ?? ''])).entries(),
  ];
  const uncategorized = (types.data ?? []).filter((type) => !type.categoryId);
  const create = (
    <Button block onClick={() => nav.push(sellerRoutes.catalog.newType(store.id))}>
      {t('suggestType')}
    </Button>
  );
  const grid = (rows: readonly CatalogTypeSummary[]) => (
    <div className="desktop:grid desktop:grid-cols-2 flex flex-col gap-3">
      {rows.map((type) => (
        <ProductTypeCard key={type.id} type={type} href={sellerRoutes.catalog.type(store.id, type.id)} />
      ))}
    </div>
  );
  return (
    <CatalogShell title={t('categories')} actions={can ? create : undefined}>
      <div className="desktop:rounded-lg desktop:border desktop:border-line desktop:bg-surface desktop:p-6 flex flex-col gap-3">
        <SearchField label={t('searchTypes')} placeholder={t('searchTypeHint')} value={q} onChange={setQ} />
        <CatalogQueryState
          pending={cats.isPending || types.isPending}
          error={cats.error ?? types.error}
          retry={() => {
            void cats.refetch();
            void types.refetch();
          }}
        />
        {!cats.error && !types.error && cats.data && types.data ? (
          <>
            {types.data.length === 0 ? <PageState kind="empty" title={t('empty')} /> : null}
            {categories
              .filter((category) => typesOf(category.id).length > 0)
              .map((category) => {
                const path = (paths.get(category.id) ?? [category.name]).join(' › ');
                return (
                  <Section
                    key={category.id}
                    title={
                      <span className="desktop:flex desktop:items-center desktop:gap-3 hidden">
                        {path}
                        <Badge>{t('group')}</Badge>
                        <span className="text-body-s text-fg-secondary">
                          {t('typeCount', { count: category.productTypeCount })}
                        </span>
                      </span>
                    }
                    className="desktop:border-0 desktop:p-0 border-0 bg-transparent p-0"
                  >
                    <ProductDataRow
                      className="desktop:hidden"
                      title={path}
                      subtitle={t('group')}
                      meta={t('typeCount', { count: category.productTypeCount })}
                      metaTone="warning"
                    />
                    {grid(typesOf(category.id))}
                  </Section>
                );
              })}
            {outsideGroups.map(([categoryId, name]) => (
              <Section
                key={categoryId}
                title={name || t('noCategory')}
                className="desktop:border-0 desktop:p-0 border-0 bg-transparent p-0"
              >
                {grid(outsideTree.filter((type) => type.categoryId === categoryId))}
              </Section>
            ))}
            {uncategorized.length ? (
              <Section
                title={t('noCategory')}
                className="desktop:border-0 desktop:p-0 border-0 bg-transparent p-0"
              >
                {grid(uncategorized)}
              </Section>
            ) : null}
          </>
        ) : null}
      </div>
    </CatalogShell>
  );
}
