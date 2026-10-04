'use client';
import { Released, useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { ButtonLink, PageShell } from '@dukani/ui-kit';

/**
 * settings «تنظیمات فروشگاه» (Figma 358:484): ten destinations in Figma order. Service items and sale shortcuts
 * follow their feature flag and order settings release 3.0 (hidden before, F04-S12); destinations whose module is
 * not built yet open the NotReleased page of the catch-all route, never a dead link.
 */
export function SettingsScreen() {
  const store = useActiveStore();
  const nav = useNavigation();
  const r = sellerRoutes;
  const id = store.id;
  return (
    <PageShell title="تنظیمات فروشگاه" back={() => nav.replace(r.store.more(id))}>
      <ButtonLink href={r.settings.store(id)}>اطلاعات و نشانی فروشگاه</ButtonLink>
      <ButtonLink href={r.settings.staff(id)}>کارکنان و دسترسی‌ها</ButtonLink>
      <ButtonLink href={r.settings.scan(id)}>تنظیمات اسکن و فروش</ButtonLink>
      <Released release="1.0" flag="service-items">
        <ButtonLink href={r.store.services(id)}>خدمات و تعرفه‌ها</ButtonLink>
        <ButtonLink href={r.more.shortcuts(id)}>میان‌برهای فروش</ButtonLink>
      </Released>
      <Released release="3.0">
        <ButtonLink href={r.settings.orders(id)}>تنظیمات سفارش و ارسال</ButtonLink>
      </Released>
      <ButtonLink href={r.settings.sessions(id)}>دستگاه‌ها و امنیت</ButtonLink>
      <ButtonLink href={r.settings.export(id)}>خروجی اطلاعات</ButtonLink>
      <ButtonLink href={r.settings.support(id)}>راهنما و پشتیبانی</ButtonLink>
      <ButtonLink href={r.stores()}>انتخاب فروشگاه</ButtonLink>
    </PageShell>
  );
}
