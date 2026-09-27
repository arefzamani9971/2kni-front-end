'use client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-heading-l text-fg-primary">خطایی رخ داد</h1>
      <p className="text-body-m text-fg-secondary">صفحه درست بارگذاری نشد. دوباره تلاش کنید.</p>
      <button type="button" onClick={reset} className="h-12 rounded-md bg-brand px-6 text-label-m text-fg-inverse">
        تلاش دوباره
      </button>
    </main>
  );
}
