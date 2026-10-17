'use client';
import { useState } from 'react';
import { useActiveStore, useCan, useDebounced, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Button,
  ButtonLink,
  PageHeader,
  PageShell,
  PageState,
  RecordList,
  SearchField,
  Section,
  Badge,
  SelectField,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import { useProductList } from '../hooks/use-product-list';
import { useProductTranslations } from '../i18n/use-product-translations';
import { useProductPresentation } from '../i18n/use-product-presentation';
export function ServicesScreen() {
  const t = useProductTranslations();
  const nav = useNavigation();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const message = useAppErrorMessage();
  const p = useProductPresentation();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'Active' | 'Archived'>('Active');
  const canonical = useDebounced(q.trim());
  const list = useProductList({ q: canonical, kind: 'Service', status, stock: 'Any', cost: 'Any' });
  const actions = (
    <>
      {can ? (
        <ButtonLink variant="primary" href={sellerRoutes.entry.service(store.id)}>
          {t('services.add')}
        </ButtonLink>
      ) : null}
      <ButtonLink variant="secondary" href={sellerRoutes.more.shortcuts(store.id)}>
        {t('shortcuts.title')}
      </ButtonLink>
    </>
  );
  return (
    <PageShell
      title={t('services.title')}
      header={
        <PageHeader
          back={nav.back}
          title={t('services.title')}
          subtitle={t('storeSubtitle', { name: store.name })}
          actions={actions}
        />
      }
      actions={actions}
      actionsClassName="desktop:hidden"
    >
      <Section title={t('search')}>
        <SearchField label={t('services.search')} value={q} onChange={setQ} />
        <SelectField
          label={t('services.status')}
          value={status}
          options={(['Active', 'Archived'] as const).map((value) => ({
            value,
            label: t(`services.${value}`),
          }))}
          onChange={(value) => setStatus(value === 'Archived' ? 'Archived' : 'Active')}
        />
        <p className="text-body-s text-fg-secondary">{t('services.hint')}</p>
        {list.isPending ? <PageState kind="loading" /> : null}
        {list.error ? (
          <PageState
            kind="error"
            description={message(list.error)}
            action={<Button onClick={() => void list.refetch()}>{t('retry')}</Button>}
          />
        ) : null}
        {list.isSuccess && !list.items.length ? <PageState kind="empty" title={t('services.empty')} /> : null}
        <RecordList
          label={t('services.title')}
          columns={[t('services.service'), t('services.priceAndShortcut'), t('services.status')]}
          rows={list.items.map((item) => {
            const identity = (
              <span className="flex flex-col gap-1">
                <strong>{item.title}</strong>
                <span className="text-body-s text-fg-secondary">
                  {item.productTypeName} · {item.baseUnitName}
                </span>
              </span>
            );
            const price = (
              <span>
                {p.price(item.baseSalePriceAmount) ?? t('noPrice')} · {item.shortcut ?? '—'}
              </span>
            );
            const status = (
              <Badge tone={item.status === 'Active' ? 'success' : 'neutral'}>
                {t(`services.${item.status}`)}
              </Badge>
            );
            return {
              id: item.id,
              card: (
                <ButtonLink block variant="secondary" href={sellerRoutes.products.detail(store.id, item.id)}>
                  <span className="flex w-full flex-col items-start gap-2">
                    {identity}
                    {price}
                    {status}
                  </span>
                </ButtonLink>
              ),
              cells: [
                <ButtonLink
                  key="title"
                  variant="secondary"
                  href={sellerRoutes.products.detail(store.id, item.id)}
                >
                  {identity}
                </ButtonLink>,
                price,
                status,
              ],
            };
          })}
        />
        {list.hasNextPage ? (
          <Button
            variant="secondary"
            loading={list.isFetchingNextPage}
            onClick={() => void list.fetchNextPage()}
          >
            {t('loadMore')}
          </Button>
        ) : null}
      </Section>
    </PageShell>
  );
}
