'use client';
import { useAppTranslations } from '../../i18n/use-app-translations';

import { Released, useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, Link, PageShell } from '@dukani/ui-kit';
import { useSeller } from '../../composition/use-seller';

/**
 * menu «بیشتر» (Figma 358:483) in Figma order, ending with the «Updated / menu» group (385:8958). Future modules
 * stay hidden until their release (the orders card is 3.0, services/shortcuts follow their flag — F04-S12); a
 * destination whose module is not built yet opens the NotReleased page of the catch-all route.
 * «خروج از حساب» is not in the frame; it stays at the end until «دستگاه‌ها و امنیت» exists (reported to design).
 */
export function MoreScreen() {
  const t = useAppTranslations();

  const store = useActiveStore();
  const { session } = useSeller();
  const nav = useNavigation();
  const r = sellerRoutes;
  const id = store.id;
  return (
    <PageShell title={t('more')} back={() => nav.replace(r.store.home(id))}>
      <Released release="3.0">
        {/* Menu item · سفارش‌ها (476:6558); the «نیازمند اقدام» count comes with the orders module */}
        <Link
          href={r.more.orders(id)}
          className="border-line bg-surface hover:bg-muted focus-visible:outline-focus flex w-full flex-col gap-0.5 rounded-md border px-4 py-3 focus-visible:outline-2"
        >
          <span className="text-heading-s text-fg-brand">{t('orders')}</span>
          <span className="text-body-s text-fg-secondary">{t('customerOrdersPrints')}</span>
        </Link>
      </Released>
      <Released release="1.0" flag="service-items">
        <ButtonLink href={r.store.services(id)}>{t('servicesRates')}</ButtonLink>
        <ButtonLink href={r.more.shortcuts(id)}>{t('salesShortcuts')}</ButtonLink>
      </Released>
      <ButtonLink href={r.inventory.list(id)}>{t('inventories')}</ButtonLink>
      <ButtonLink href={r.products.list(id)}>{t('storeProductList')}</ButtonLink>
      <ButtonLink href={r.more.catalog(id)}>{t('catalogList')}</ButtonLink>
      <ButtonLink href={r.entry.method(id)}>{t('recordProduct')}</ButtonLink>
      <ButtonLink href={r.more.catalogNew(id)}>{t('recordCatalog')}</ButtonLink>
      <ButtonLink href={r.more.categories(id)}>{t('categoriesTypes')}</ButtonLink>
      <ButtonLink href={r.purchases.list(id)}>{t('purchasesSuppliers')}</ButtonLink>
      <ButtonLink href={r.more.debtors(id)}>{t('debtors')}</ButtonLink>
      <ButtonLink href={r.store.settings(id)}>{t('storeSettings')}</ButtonLink>
      <ButtonLink href={r.settings.store(id)}>{t('storeInformation')}</ButtonLink>
      <ButtonLink href={r.more.credit(id)}>{t('creditOverview')}</ButtonLink>
      <ButtonLink href={r.store.checks(id)}>{t('receivedChecks')}</ButtonLink>
      <Button
        variant="danger-secondary"
        block
        iconStart="logout"
        onClick={async () => {
          await session.signOut();
          nav.replace(r.login());
        }}
      >
        {t('logout')}
      </Button>
    </PageShell>
  );
}
