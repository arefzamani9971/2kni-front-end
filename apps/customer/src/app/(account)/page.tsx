'use client';
import { toPersianDigits } from '@dukani/domain';
import { useNavigation, useSessionState } from '@dukani/platform';
import { customerRoutes } from '@dukani/routes';
import { Button, PageShell, PageState } from '@dukani/ui-kit';
import { useCustomer } from '../../composition/providers';

/** customerhome (Figma 20b): buyer features (purchases, debts, settlements) arrive in phase 1.2. */
export default function CustomerHome() {
  const { session } = useCustomer();
  const state = useSessionState(session);
  const nav = useNavigation();
  const mobile = state.status === 'signed-in' ? toPersianDigits(state.user.mobile) : '';
  return (
    <PageShell title="خریدهای من" subtitle={mobile ? `دکانی · ${mobile}` : 'دکانی'}>
      <PageState kind="not-released" title="پنل مشتری به‌زودی" description="خریدها، فاکتورها و بدهی‌های شما در فروشگاه‌ها اینجا نمایش داده می‌شود." />
      <Button
        variant="secondary"
        block
        iconStart="logout"
        onClick={async () => {
          await session.signOut();
          nav.replace(customerRoutes.login());
        }}
      >
        خروج از حساب
      </Button>
    </PageShell>
  );
}
