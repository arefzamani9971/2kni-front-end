'use client';
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
  const store = useActiveStore();
  const { session } = useSeller();
  const nav = useNavigation();
  const r = sellerRoutes;
  const id = store.id;
  return (
    <PageShell title="بیشتر" back={() => nav.replace(r.store.home(id))}>
      <Released release="3.0">
        {/* Menu item · سفارش‌ها (476:6558); the «نیازمند اقدام» count comes with the orders module */}
        <Link
          href={r.more.orders(id)}
          className="border-line bg-surface hover:bg-muted focus-visible:outline-focus flex w-full flex-col gap-0.5 rounded-md border px-4 py-3 focus-visible:outline-2"
        >
          <span className="text-heading-s text-fg-brand">سفارش‌ها</span>
          <span className="text-body-s text-fg-secondary">سفارش کالا و پرینت مشتریان</span>
        </Link>
      </Released>
      <Released release="1.0" flag="service-items">
        <ButtonLink href={r.store.services(id)}>خدمات و تعرفه‌ها</ButtonLink>
        <ButtonLink href={r.more.shortcuts(id)}>میان‌برهای فروش</ButtonLink>
      </Released>
      <ButtonLink href={r.inventory.list(id)}>فهرست موجودی‌ها</ButtonLink>
      <ButtonLink href={r.products.list(id)}>فهرست کالاهای فروشگاه</ButtonLink>
      <ButtonLink href={r.more.catalog(id)}>فهرست کاتالوگ</ButtonLink>
      <ButtonLink href={r.entry.method(id)}>ثبت کالا</ButtonLink>
      <ButtonLink href={r.more.catalogNew(id)}>ثبت کاتالوگ</ButtonLink>
      <ButtonLink href={r.more.categories(id)}>دسته‌بندی‌ها و نوع کالا</ButtonLink>
      <ButtonLink href={r.purchases.list(id)}>خریدها و تأمین‌کنندگان</ButtonLink>
      <ButtonLink href={r.more.debtors(id)}>بدهکاران و نسیه‌بگیران</ButtonLink>
      <ButtonLink href={r.store.settings(id)}>تنظیمات فروشگاه</ButtonLink>
      <ButtonLink href={r.settings.store(id)}>اطلاعات فروشگاه</ButtonLink>
      <ButtonLink href={r.more.credit(id)}>نمای کلی نسیه</ButtonLink>
      <ButtonLink href={r.store.checks(id)}>چک‌های دریافتی</ButtonLink>
      <Button
        variant="danger-secondary"
        block
        iconStart="logout"
        onClick={async () => {
          await session.signOut();
          nav.replace(r.login());
        }}
      >
        خروج از حساب
      </Button>
    </PageShell>
  );
}
