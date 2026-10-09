'use client';
import { useAppTranslations } from '../i18n/use-app-translations';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useAppTranslations();

  return (
    <main className="mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-heading-l text-fg-primary">{t('errorTitle')}</h1>
      <p className="text-body-m text-fg-secondary">{t('errorDescription')}</p>
      <button
        type="button"
        onClick={reset}
        className="bg-brand text-label-m text-fg-inverse h-12 rounded-md px-6"
      >
        {t('retry')}
      </button>
    </main>
  );
}
