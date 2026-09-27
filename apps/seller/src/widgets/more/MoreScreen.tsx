'use client';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, PageShell } from '@dukani/ui-kit';
import { useSeller } from '../../composition/providers';

/** menu (Figma 358:483): every destination outside the four main tabs. */
export function MoreScreen() {
  const store = useActiveStore();
  const { session } = useSeller();
  const nav = useNavigation();
  const r = sellerRoutes;
  const id = store.id;
  const items: { label: string; href: string }[] = [
    { label: 'فهرست موجودی‌ها', href: r.inventory.list(id) },
    { label: 'فهرست کالاهای فروشگاه', href: r.products.list(id) },
    { label: 'ثبت کالا', href: r.entry.method(id) },
    { label: 'خریدها و تأمین‌کنندگان', href: r.purchases.list(id) },
    { label: 'بدهکاران و نسیه‌بگیران', href: `/s/${id}/debts` },
    { label: 'تنظیمات فروشگاه', href: r.store.settings(id) },
    { label: 'فروشگاه‌های من', href: r.stores() },
  ];
  return (
    <PageShell title="بیشتر" subtitle={store.name}>
      {items.map((i) => (
        <ButtonLink key={i.label} href={i.href}>
          {i.label}
        </ButtonLink>
      ))}
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
