'use client';
import { useAppTranslations } from '../../i18n/use-app-translations';

import { toPersianDigits } from '@dukani/domain';
import { useNavigation, useSessionState } from '@dukani/platform';
import { customerRoutes } from '@dukani/routes';
import { Button, PageShell, PageState } from '@dukani/ui-kit';
import { useCustomer } from '../../composition/use-customer';

/** customerhome (Figma 20b): buyer features (purchases, debts, settlements) arrive in phase 1.2. */
export default function CustomerHome() {
  const t = useAppTranslations();

  const { session } = useCustomer();
  const state = useSessionState(session);
  const nav = useNavigation();
  const mobile = state.status === 'signed-in' ? toPersianDigits(state.user.mobile) : '';
  return (
    <PageShell title={t('myPurchases')} subtitle={mobile ? t('storeSubtitle', { name: mobile }) : t('brand')}>
      <PageState kind="not-released" title={t('customerSoon')} description={t('customerIntro')} />
      <Button
        variant="secondary"
        block
        iconStart="logout"
        onClick={async () => {
          await session.signOut();
          nav.replace(customerRoutes.login());
        }}
      >
        {t('logout')}
      </Button>
    </PageShell>
  );
}
