import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-heading-l text-fg-primary">صفحه پیدا نشد</h1>
      <p className="text-body-m text-fg-secondary">نشانی را بررسی کنید یا به صفحهٔ اصلی بروید.</p>
      <Link href="/" className="text-label-m text-fg-brand">
        صفحهٔ اصلی
      </Link>
    </main>
  );
}
