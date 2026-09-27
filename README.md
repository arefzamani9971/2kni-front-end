# 2kni-front-end — فرانت‌اند دکانی

Monorepo فرانت‌اند دکانی (Next.js 16 + React 19 + TypeScript strict، pnpm + Nx، Tailwind v4): اپ فروشنده،
اپ مشتری و لندینگ، روی قرارداد OpenAPI بک‌اند .NET.

- معماری، ماژول‌ها و درخت مخزن: [`docs/architecture/frontend-architecture.md`](docs/architecture/frontend-architecture.md)
- فهرست اسناد: [`docs/README.md`](docs/README.md) · استقرار: [`deploy/README.md`](deploy/README.md)
- هر Feature یک README دارد: `packages/features/*/README.md`

## شروع

```bash
corepack enable && pnpm install
pnpm dev:seller        # http://localhost:3001 — بک‌اند mock (MSW) به‌صورت پیش‌فرض
pnpm dev:landing       # http://localhost:3000
pnpm dev:customer      # http://localhost:3002
pnpm storybook         # ui-kit روی http://localhost:6006
```

ورود آزمایشی در حالت mock: موبایل `09123456789`، کد `123456` (فروشگاه «نوشت‌افزار آفتاب»).
شمارهٔ دیگر = کاربر تازه (مسیر ساخت فروشگاه). `09129999999` حالت «حساب مسدود» را نشان می‌دهد.
داده‌های mock در localStorage مرورگر می‌ماند؛ `window.__dukaniMock.reset()` آن را به FIXTURE-01 برمی‌گرداند.

اتصال به بک‌اند واقعی: `NEXT_PUBLIC_API_MODE=live` و `NEXT_PUBLIC_API_URL` (و `API_INTERNAL_URL` برای BFF) — `.env.example`.

## دستورها

| دستور | کار |
|---|---|
| `pnpm check` | lint + typecheck + test همهٔ پروژه‌ها (Nx) |
| `pnpm build` | build همهٔ اپ‌ها |
| `pnpm gen:contracts` | تولید دوبارهٔ تایپ‌ها از `docs/reference/backend/openapi.json` |
| `pnpm gen:feature <name> --scope seller` | اسکلت یک Feature با لایه‌های استاندارد |
| `node tools/scripts/flow-entry.mjs <out>` | اجرای جریان ثبت کالا در Chromium با اسکرین‌شات (همین‌طور `flow-seller`، `flow-purchase`) |
| `docker compose -f compose.yaml -f compose.mock.yaml up --build` | دمو کامل در Docker |

## جریان‌های آماده (موبایل)

لندینگ → ورود با کد پیامکی → فروشگاه‌های من / ساخت فروشگاه (ST02) → خانه → افزودن کالا (جست‌وجو، بارکد،
کاتالوگ یا کالای جدید، واحد و بسته، موجودی اول دوره یا خرید، قیمت‌گذاری، بازبینی، ثبت) → کالاها و جزئیات →
ثبت خرید (قلم‌ها، جمع، پیوست، ثبت نهایی با کنترل فاکتور تکراری).
