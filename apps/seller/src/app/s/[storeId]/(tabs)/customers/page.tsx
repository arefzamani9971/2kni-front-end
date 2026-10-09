'use client';
import { useAppTranslations } from '../../../../../i18n/use-app-translations';

import { NotReleasedScreen } from '../../../../../widgets/NotReleasedScreen';

export default function CustomersPage() {
  const t = useAppTranslations();

  return <NotReleasedScreen title={t('customers')} />;
}
