'use client';
import { useState } from 'react';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, SearchField, ProductDataRow, Section, PageState, Badge } from '@dukani/ui-kit';
import { flattenCategories } from '../../domain/categories';
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
  const cats = useCatalogQuery(['categories'], (port, id, signal) => port.categories(id, signal));
  const types = useCatalogQuery(['types', q], (port, id, signal) => port.types(id, q, signal));
  const categories = flattenCategories(cats.data ?? []);
  const create = (
    <Button block onClick={() => nav.push(sellerRoutes.catalog.newType(store.id))}>
      {t('suggestType')}
    </Button>
  );
  return (
    <CatalogShell title={t('categories')} actions={can ? create : undefined}>
      <div className="desktop:rounded-lg desktop:border desktop:border-line desktop:bg-surface desktop:p-6 flex flex-col gap-3">
        <SearchField
          label={t('searchTypes')}
          placeholder={t('searchTypeHint')}
          value={q}
          onChange={(value) => {
            setQ(value);
            nav.replace(sellerRoutes.catalog.categories(store.id, value));
          }}
        />
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
              .filter((category) => (types.data ?? []).some((type) => type.categoryId === category.id))
              .map((category) => (
                <Section
                  key={category.id}
                  title={
                    <span className="desktop:flex desktop:items-center desktop:gap-3 hidden">
                      {category.name}
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
                    title={category.name}
                    subtitle={t('group')}
                    meta={t('typeCount', { count: category.productTypeCount })}
                    metaTone="warning"
                  />
                  <div className="desktop:grid desktop:grid-cols-2 flex flex-col gap-3">
                    {(types.data ?? [])
                      .filter((type) => type.categoryId === category.id)
                      .map((type) => (
                        <ProductTypeCard
                          key={type.id}
                          type={type}
                          href={sellerRoutes.catalog.type(store.id, type.id)}
                        />
                      ))}
                  </div>
                </Section>
              ))}
            {types.data
              .filter((type) => !categories.some((category) => category.id === type.categoryId))
              .map((type) => (
                <ProductTypeCard
                  key={type.id}
                  type={type}
                  href={sellerRoutes.catalog.type(store.id, type.id)}
                />
              ))}
          </>
        ) : null}
      </div>
    </CatalogShell>
  );
}
