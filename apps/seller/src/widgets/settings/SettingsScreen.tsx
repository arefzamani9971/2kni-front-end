'use client';
import { useAppTranslations } from '../../i18n/use-app-translations';

import { Released, useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { ButtonLink, PageShell } from '@dukani/ui-kit';

/**
 * settings «تنظیمات فروشگاه» (Figma 358:484): ten destinations in Figma order. Service items and sale shortcuts
 * follow their feature flag and order settings release 3.0 (hidden before, F04-S12); destinations whose module is
 * not built yet open the NotReleased page of the catch-all route, never a dead link.
 */
export function SettingsScreen() {
  const t = useAppTranslations();

  const store = useActiveStore();
  const nav = useNavigation();
  const r = sellerRoutes;
  const id = store.id;
  return (
    <PageShell title={t('storeSettings')} back={() => nav.replace(r.store.more(id))}>
      <ButtonLink href={r.settings.store(id)}>{t('storeAddress')}</ButtonLink>
      <ButtonLink href={r.settings.staff(id)}>{t('staffAccess')}</ButtonLink>
      <ButtonLink href={r.settings.scan(id)}>{t('scanSalesSettings')}</ButtonLink>
      <Released release="1.0" flag="service-items">
        <ButtonLink href={r.store.services(id)}>{t('servicesRates')}</ButtonLink>
        <ButtonLink href={r.more.shortcuts(id)}>{t('salesShortcuts')}</ButtonLink>
      </Released>
      <Released release="3.0">
        <ButtonLink href={r.settings.orders(id)}>{t('shippingSettings')}</ButtonLink>
      </Released>
      <ButtonLink href={r.settings.sessions(id)}>{t('devicesSecurity')}</ButtonLink>
      <ButtonLink href={r.settings.export(id)}>{t('dataExport')}</ButtonLink>
      <ButtonLink href={r.settings.support(id)}>{t('helpSupport')}</ButtonLink>
      <ButtonLink href={r.stores()}>{t('selectStore')}</ButtonLink>
    </PageShell>
  );
}
