'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useProductTranslations } from '../i18n/use-product-translations';
import { useProductPresentation } from '../i18n/use-product-presentation';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Button,
  ButtonLink,
  Chip,
  ChipGroup,
  PageShell,
  PageState,
  ProductDataRow,
  SearchField,
  Section,
} from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { stockTone } from '../../domain/product';
import type { ProductFilter } from '../../domain/product.types';
import { useProductList } from '../hooks/use-product-list';

/** products (Figma 312:9504, empty 312:10728): store items with stock and price (F15). */
export function ProductsScreen({
  filter,
  onFilter,
}: {
  filter: ProductFilter;
  onFilter: (f: ProductFilter) => void;
}) {
  const t = useProductTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = useProductPresentation();

  const store = useActiveStore();
  const nav = useNavigation();
  const canAdd = useCan('product.manage');
  const [q, setQ] = useState(filter.q);
  useEffect(() => {
    const t = setTimeout(() => q !== filter.q && onFilter({ ...filter, q }), 350);
    return () => clearTimeout(t);
  }, [q, filter, onFilter]);
  const list = useProductList(filter);
  const filtered = filter.q || filter.stock !== 'Any' || filter.cost !== 'Any';

  return (
    <PageShell
      title={t('storeProducts')}
      subtitle={t('storeSubtitle', { name: store.name })}
      actions={
        canAdd ? (
          <Button block iconStart="plus" onClick={() => nav.push(sellerRoutes.entry.method(store.id))}>
            {t('addProduct')}
          </Button>
        ) : undefined
      }
    >
      <Section title={t('search')}>
        <SearchField label={t('nameCode')} value={q} onChange={setQ} placeholder={t('searchPlaceholder')} />
        <ChipGroup label={t('stockFilter')}>
          {(['Any', 'Low', 'Out'] as const).map((s) => (
            <Chip
              key={s}
              selected={filter.stock === s && filter.cost === 'Any'}
              onClick={() => onFilter({ ...filter, stock: s, cost: 'Any' })}
            >
              {t(`filters.${s}`)}
            </Chip>
          ))}
          <Chip
            selected={filter.cost === 'Unknown'}
            onClick={() =>
              onFilter({ ...filter, stock: 'Any', cost: filter.cost === 'Unknown' ? 'Any' : 'Unknown' })
            }
          >
            {t('filters.Unknown')}
          </Chip>
        </ChipGroup>
      </Section>
      {list.isPending ? <PageState kind="loading" rows={4} /> : null}
      {list.error ? (
        <PageState
          kind="error"
          description={errorMessage(list.error)}
          action={
            <Button variant="secondary" onClick={() => void list.refetch()}>
              {t('retry')}
            </Button>
          }
        />
      ) : null}
      {list.isSuccess && list.items.length === 0 ? (
        filtered ? (
          <PageState kind="empty" title={t('noMatches')} description={t('changeFilter')} />
        ) : (
          <PageState
            kind="empty"
            title={t('empty')}
            description={t('emptyHint')}
            action={
              canAdd ? (
                <ButtonLink href={sellerRoutes.entry.method(store.id)} variant="primary">
                  {t('addProduct')}
                </ButtonLink>
              ) : undefined
            }
          />
        )
      ) : null}
      {list.items.length > 0 ? (
        <ul className="flex flex-col gap-3" aria-label={t('storeProducts')}>
          {list.items.map((p) => (
            <li key={p.id}>
              <ProductDataRow
                href={sellerRoutes.products.detail(store.id, p.id)}
                title={p.title}
                subtitle={[p.productTypeName, p.brandName].filter(Boolean).join(' · ')}
                meta={[presentation.productLine(p), presentation.stockNote(p)].filter(Boolean).join(' · ')}
                metaTone={stockTone(p)}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {list.hasNextPage ? (
        <Button variant="secondary" block loading={list.isFetchingNextPage} onClick={list.fetchNextPage}>
          {t('loadMore')}
        </Button>
      ) : null}
    </PageShell>
  );
}
