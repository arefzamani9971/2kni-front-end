import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-heading-l">صفحه پیدا نشد</h1>
      <Link href="/" className="text-label-m text-fg-brand">
        بازگشت به دکانی
      </Link>
    </main>
  );
}
