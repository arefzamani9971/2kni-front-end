import { useAppTranslations } from '../i18n/use-app-translations';
import Link from 'next/link';

export default function NotFound() {
  const t = useAppTranslations();

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-heading-l">{t('notFound')}</h1>
      <Link href="/" className="text-label-m text-fg-brand">
        {t('backToDukani')}
      </Link>
    </main>
  );
}
