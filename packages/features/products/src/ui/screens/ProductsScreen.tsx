'use client';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, Chip, ChipGroup, PageShell, PageState, ProductDataRow, SearchField, Section } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { FILTER_LABELS, productLine, stockNote, stockTone, type ProductFilter } from '../../domain/product';
import { useProductList } from '../hooks/use-products';

/** products (Figma 312:9504, empty 312:10728): store items with stock and price (F15). */
export function ProductsScreen({ filter, onFilter }: { filter: ProductFilter; onFilter: (f: ProductFilter) => void }) {
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
      title="کالاهای فروشگاه"
      subtitle={`دکانی · ${store.name}`}
      actions={
        canAdd ? (
          <Button block iconStart="plus" onClick={() => nav.push(sellerRoutes.entry.method(store.id))}>
            افزودن کالا
          </Button>
        ) : undefined
      }
    >
      <Section title="جست‌وجو">
        <SearchField label="نام یا کد کالا" value={q} onChange={setQ} placeholder="جست‌وجوی کالا" />
        <ChipGroup label="فیلتر موجودی">
          {(['Any', 'Low', 'Out'] as const).map((s) => (
            <Chip key={s} selected={filter.stock === s && filter.cost === 'Any'} onClick={() => onFilter({ ...filter, stock: s, cost: 'Any' })}>
              {FILTER_LABELS[s]}
            </Chip>
          ))}
          <Chip selected={filter.cost === 'Unknown'} onClick={() => onFilter({ ...filter, stock: 'Any', cost: filter.cost === 'Unknown' ? 'Any' : 'Unknown' })}>
            {FILTER_LABELS.Unknown}
          </Chip>
        </ChipGroup>
      </Section>
      {list.isPending ? <PageState kind="loading" rows={4} /> : null}
      {list.error ? (
        <PageState
          kind="error"
          description={list.error.message}
          action={
            <Button variant="secondary" onClick={() => void list.refetch()}>
              تلاش دوباره
            </Button>
          }
        />
      ) : null}
      {list.isSuccess && list.items.length === 0 ? (
        filtered ? (
          <PageState kind="empty" title="کالایی با این شرایط نیست" description="عبارت یا فیلتر را تغییر دهید." />
        ) : (
          <PageState
            kind="empty"
            title="هنوز کالایی ندارید"
            description="اولین کالا را با جست‌وجو در کاتالوگ یا ثبت دستی اضافه کنید."
            action={canAdd ? <ButtonLink href={sellerRoutes.entry.method(store.id)} variant="primary">افزودن کالا</ButtonLink> : undefined}
          />
        )
      ) : null}
      {list.items.length > 0 ? (
        <ul className="flex flex-col gap-3" aria-label="کالاهای فروشگاه">
          {list.items.map((p) => (
            <li key={p.id}>
              <ProductDataRow
                href={sellerRoutes.products.detail(store.id, p.id)}
                title={p.title}
                subtitle={[p.productTypeName, p.brandName].filter(Boolean).join(' · ')}
                meta={[productLine(p), stockNote(p)].filter(Boolean).join(' · ')}
                metaTone={stockTone(p)}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {list.hasNextPage ? (
        <Button variant="secondary" block loading={list.isFetchingNextPage} onClick={list.fetchNextPage}>
          کالاهای بیشتر
        </Button>
      ) : null}
    </PageShell>
  );
}
