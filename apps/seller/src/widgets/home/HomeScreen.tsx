'use client';
import { useActiveStore } from '@dukani/platform';
import { AttentionSection, TodayMetricsRow, WeekSalesSection, type AttentionAction } from '@dukani/reports';
import { sellerRoutes } from '@dukani/routes';
import { ButtonLink, PageShell, Section } from '@dukani/ui-kit';

/**
 * home (Figma 312:8673): a widget composing the reports feature with app routes.
 * Features never link to each other; the app decides where each daily task goes.
 */
export function HomeScreen() {
  const store = useActiveStore();
  const r = sellerRoutes;
  const id = store.id;
  const attention: AttentionAction[] = [
    { kind: 'LowStock', label: 'مشاهده کمبودها', href: `${r.products.list(id)}?stock=Low` },
    { kind: 'OutOfStock', label: 'کالاهای تمام‌شده', href: `${r.products.list(id)}?stock=Out` },
    { kind: 'UnknownCost', label: 'تکمیل بهای کالاها', href: `${r.products.list(id)}?cost=Unknown` },
    { kind: 'DraftPurchase', label: 'ادامهٔ خریدهای پیش‌نویس', href: `${r.purchases.list(id)}?status=Draft` },
  ];
  return (
    <PageShell title="امروز در فروشگاه" subtitle={`دکانی · ${store.name}`}>
      <TodayMetricsRow />
      <Section title="کارهای روزانه">
        <ButtonLink href={r.sales.new(id)}>ثبت فروش</ButtonLink>
        <ButtonLink href={r.entry.method(id)}>افزودن کالا</ButtonLink>
        <ButtonLink href={r.products.list(id)}>کالا و موجودی</ButtonLink>
        <ButtonLink href={r.purchases.new(id)}>ثبت خرید</ButtonLink>
        <ButtonLink href={r.store.customers(id)}>مشتریان و بدهی</ButtonLink>
        <ButtonLink href={r.store.reports(id)}>گزارش‌ها</ButtonLink>
      </Section>
      <AttentionSection actions={attention} />
      <WeekSalesSection />
      <div className="flex flex-col gap-3">
        <ButtonLink href={r.inventory.list(id)}>فهرست موجودی‌ها</ButtonLink>
        <ButtonLink href={r.purchases.list(id)}>خریدها و تأمین‌کنندگان</ButtonLink>
      </div>
    </PageShell>
  );
}
