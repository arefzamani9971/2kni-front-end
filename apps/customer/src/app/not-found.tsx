import { useAppTranslations } from '../i18n/use-app-translations';
import Link from 'next/link';

export default function NotFound() {
  const t = useAppTranslations();

  return (
    <main className="mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-heading-l text-fg-primary">{t('notFound')}</h1>
      <p className="text-body-m text-fg-secondary">{t('notFoundDescription')}</p>
      <Link href="/" className="text-label-m text-fg-brand">
        {t('homePage')}
      </Link>
    </main>
  );
}
