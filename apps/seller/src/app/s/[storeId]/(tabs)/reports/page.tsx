'use client';
import { useAppTranslations } from '../../../../../i18n/use-app-translations';

import { NotReleasedScreen } from '../../../../../widgets/NotReleasedScreen';

export default function ReportsPage() {
  const t = useAppTranslations();

  return <NotReleasedScreen title={t('reports')} />;
}
