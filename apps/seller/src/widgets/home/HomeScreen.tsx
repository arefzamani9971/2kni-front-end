'use client';
import { useAppTranslations } from '../../i18n/use-app-translations';

import { useActiveStore } from '@dukani/platform';
import { AttentionSection, TodayMetricsRow, WeekSalesSection, type AttentionAction } from '@dukani/reports';
import { sellerRoutes } from '@dukani/routes';
import { ButtonLink, PageShell, Section } from '@dukani/ui-kit';

/**
 * home (Figma 312:8673): a widget composing the reports feature with app routes.
 * Features never link to each other; the app decides where each daily task goes. Texts and order follow the frame
 * («Additional / home» 365:3641); purchases are reached from the menu.
 */
export function HomeScreen() {
  const t = useAppTranslations();

  const store = useActiveStore();
  const r = sellerRoutes;
  const id = store.id;
  const attention: AttentionAction[] = [
    { kind: 'LowStock', label: t('viewShortages'), href: `${r.products.list(id)}?stock=Low` },
    { kind: 'OutOfStock', label: t('outOfStock'), href: `${r.products.list(id)}?stock=Out` },
    { kind: 'UnknownCost', label: t('completeCosts'), href: `${r.products.list(id)}?cost=Unknown` },
    { kind: 'DraftPurchase', label: t('resumePurchases'), href: `${r.purchases.list(id)}?status=Draft` },
  ];
  return (
    <PageShell title={t('storeToday')} subtitle={t('storeSubtitle', { name: store.name })}>
      <TodayMetricsRow />
      <Section title={t('dailyTasks')}>
        <ButtonLink href={r.sales.new(id)}>{t('recordSale')}</ButtonLink>
        <ButtonLink href={r.entry.method(id)}>{t('addStoreProduct')}</ButtonLink>
        <ButtonLink href={r.products.list(id)}>{t('productsInventory')}</ButtonLink>
        <ButtonLink href={r.store.customers(id)}>{t('customersDebts')}</ButtonLink>
        <ButtonLink href={r.store.reports(id)}>{t('reports')}</ButtonLink>
      </Section>
      <AttentionSection actions={attention} />
      <WeekSalesSection />
      <div className="flex flex-col gap-3">
        <ButtonLink href={r.inventory.list(id)}>{t('inventories')}</ButtonLink>
        <ButtonLink href={r.sales.new(id)}>{t('sellProduct')}</ButtonLink>
        <ButtonLink href={r.more.actions(id)}>{t('storeActions')}</ButtonLink>
      </div>
    </PageShell>
  );
}
