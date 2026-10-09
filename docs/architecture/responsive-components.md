# کامپوننت‌های واکنش‌گرا (موبایل ↔ دسکتاپ)

> نسخه ۱.۰ — ۱۴۰۵/۰۷/۰۷ (2026-09-29). مکمل [`frontend-architecture.md`](./frontend-architecture.md) §۳.
> مبنا: قوانین فیگما (`UYer2tdXokR61KYthMtPfb`، صفحه‌های 00، 02، 16، 17، 18، 20، 20b) و پیشنهاد `reponsive.md` (لایهٔ میانجی Strategy/Facade).

## ۱. مسئله

فیگمای جدید برای بیشتر کامپوننت‌ها variant `Viewport=Mobile|Desktop` دارد. اما همهٔ این تفاوت‌ها از یک جنس نیستند:

| نوع تفاوت               | نمونه در فیگما                                                                                                        | راه‌حل          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------- |
| **اندازه، فاصله، چینش** | Button/Option Item: ۴۸ موبایل، ۴۰ دسکتاپ؛ padding صفحه ۱۶ ↔ ۲۴؛ StickyActionBar ستونی ↔ سطری                          | سطح ۱: فقط CSS  |
| **ساختار DOM یا تعامل** | Select: Bottom Sheet ↔ لیست باز شده زیر فیلد؛ Confirmation/Form Overlay: Sheet ↔ Dialog ۵۶۰؛ Bottom Nav ↔ Sidebar ۲۴۰ | سطح ۲: Strategy |

## ۲. نظر دربارهٔ `reponsive.md`

پیشنهاد لایهٔ میانجی درست است. یک Facade که بین پیاده‌سازی موبایل و دسکتاپ انتخاب کند و قرارداد مشترکی داشته باشد، الگوی Strategy است و مصرف‌کننده را از دانستن viewport بی‌نیاز می‌کند. سه اصلاح لازم دارد:

1. **همه‌چیز Strategy نیست.** اگر برای هر تفاوت اندازه دو کامپوننت بسازیم، تعداد فایل‌ها دو برابر می‌شود و دو نسخه از هم فاصله می‌گیرند. تا وقتی DOM یکی است، تفاوت با CSS حل می‌شود.
2. **یک منبع برای viewport.** اگر هر کامپوننت خودش `matchMedia` بخواند، Portalها (Sheet، Popover، Toast) و CSS ممکن است با JS هم‌نظر نباشند. پس فقط یک `ViewportProvider` داریم که مقدار را روی `<html data-viewport>` هم می‌نویسد.
3. **پیشوند در نام نمی‌گذاریم.** نام‌هایی مثل Responsive، Adaptive، Unified یا Smart جزئیات پیاده‌سازی را وارد API می‌کنند. Facade نام خود مفهوم را دارد (`Overlay`، `SelectField`)، و Strategyها نام خصوصی دارند (`OverlaySheet`، `OverlayDialog`).

## ۳. سیگنال viewport

- ملاک **عرض فضای layout** است، نه نوع دستگاه یا user agent (ui-guidelines §۱۲: Wide ≥ ۱۰۲۴). ثابت‌ها در `@dukani/design-tokens` قرار دارند: `VIEWPORT_DESKTOP_MIN`، `VIEWPORT_DESKTOP_QUERY`، `VIEWPORT_ATTRIBUTE`.
- `ViewportProvider` (در `apps/*/src/composition/providers.tsx`) مقدار را با `useSyncExternalStore` روی `matchMedia` می‌خواند و روی `<html data-viewport>` می‌نویسد.
- `ViewportScript` داخل `<head>` در root layout (از مسیر `@dukani/ui-kit/viewport-script`، بدون `'use client'`) attribute را **قبل از اولین paint** تنظیم می‌کند. به همین دلیل روی `<html>` مقدار `suppressHydrationWarning` لازم است.
- در SSR مقدار پیش‌فرض `mobile` است. تفاوت‌های سطح ۱ هیچ‌وقت چشمک نمی‌زنند. تفاوت‌های سطح ۲ فقط برای Overlayها و پنل‌ها هستند که در لحظهٔ hydration بسته‌اند، پس کاربر پرشی نمی‌بیند.
- `forced` برای Storybook (نوار ابزار «Viewport»)، تست‌ها و اپی که فقط دسکتاپ دارد (admin).

```tsx
// app/layout.tsx
<html lang="fa" dir="rtl" data-theme="shop" suppressHydrationWarning>
  <head>
    <ViewportScript />
  </head>
  <body>
    <AppProviders>{children}</AppProviders>
  </body>
</html>
```

## ۴. سطح ۱ — فقط CSS

- واریانت Tailwind به نام `desktop:` روی `[data-viewport='desktop']` تعریف شده است (`design-tokens/src/theme.css`)، نه روی media query. به این ترتیب Portalها و Storybook هم از آن پیروی می‌کنند.
- **توکن‌های تراکم (density)** با attribute عوض می‌شوند و کامپوننت اصلاً شرط ندارد:

| توکن                      | موبایل | دسکتاپ | کلاس Tailwind                                  |
| ------------------------- | ------ | ------ | ---------------------------------------------- |
| `--dukani-control`        | ۴۸     | ۴۰     | `h-control-adaptive`، `min-h-control-adaptive` |
| `--dukani-layout-padding` | ۱۶     | ۲۴     | `p-layout`                                     |
| `--dukani-layout-gutter`  | ۲۴     | ۲۴     | `gap-gutter`                                   |
| `--dukani-layout-sidebar` | —      | ۲۴۰    | `w-sidebar`                                    |

```tsx
// Button md: یک کامپوننت، دو variant فیگما
md: 'h-control-adaptive px-4 desktop:px-5';
```

مصرف‌کنندهٔ فعلی: Button، IconButton، OptionList، ScreenHeader، ScreenTop، StickyActionBar، Screen (sidebar و bottom nav)، Toast (جای قرارگیری).

## ۵. سطح ۲ — Strategy

```ts
export const Overlay = createAdaptive<OverlayProps>('Overlay', {
  mobile: OverlaySheet, // vaul Bottom Sheet، دکمه‌ها ستونی
  desktop: OverlayDialog, // Radix Dialog ۵۶۰، دکمه‌ها سطری
});
```

قواعد (در `ui-kit/src/responsive/adaptive.tsx` هم آمده است):

1. **قرارداد یکسان (Liskov).** هر دو Strategy دقیقاً همان Props را می‌گیرند. prop مخصوص یک viewport ممنوع است. اگر لازم شد، یعنی تفاوت را باید در سطح ۱ حل کرد یا قرارداد را بازطراحی کرد.
2. **Strategyها stateless هستند.** state مثل `open`، مقدار فیلد یا متن جستجو در Facade یا فراخوان نگه داشته می‌شود. اگر پنجره در حالی که Overlay باز است از ۱۰۲۴ رد شود، ظاهر عوض می‌شود ولی state از دست نمی‌رود (تست دارد).
3. **دسترس‌پذیری مشترک و تست‌شده.** نقش‌های ARIA، ترتیب فوکوس، Escape و بازگشت فوکوس به trigger برای هر دو Strategy با یک تست بررسی می‌شوند (`responsive/responsive.test.tsx`).
4. **Feature کد viewport نمی‌نویسد.** محتوا و رفتار واحد است؛ تعداد ستون‌ها، چیدمان و انتخاب Strategy داخل ui-kit حل می‌شوند. `useViewport` و `useByViewport` در فیچر استفاده نمی‌شوند.
5. **ابزارهای کوچک‌تر.** `useByViewport({ mobile, desktop })` برای یک مقدار، `ViewportSwitch` برای یک شاخهٔ JSX در Storyها و layout.

### نگاشت فعلی

| Facade                                       | موبایل                                       | دسکتاپ                                                 | فیگما                                   |
| -------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| `Overlay`                                    | BottomSheet (`size="full"` یعنی تمام‌ارتفاع) | Dialog ۵۶۰ (`full` یعنی ۷۲۰)                           | Form Overlay `633:494`                  |
| `ConfirmDialog` (روی Overlay)                | دکمه‌ها ستونی، اقدام اصلی بالا               | دکمه‌ها سطری                                           | Confirmation Overlay `633:347`          |
| `PickerPanel`                                | BottomSheet                                  | Popover لنگرشده به فیلد، عرض برابر trigger، حداکثر ۳۶۰ | Select `649:666`                        |
| `SelectField` (روی PickerPanel و OptionList) | Sheet و لیست                                 | Listbox زیر فیلد                                       | Select `649:666`، Option Item `649:581` |
| `DateField` (روی DatePickerPanel) | Sheet با چرخ‌های روز، ماه و سال | Popover با عرض محتوایی ۳۵۲ و اسکرول متناسب فضای موجود | `633:688`، موبایل `633:495`، دسکتاپ `633:592` |
| `Screen` / `PageShell` / `TabsShell`         | Bottom Navigation                            | `DesktopSidebar` ۲۴۰                                   | Desktop Sidebar `498:563`               |
| `Toast`                                      | بالای Bottom Nav                             | گوشهٔ بالا، ۴۲۰                                        | Toast `635:539`                         |

## ۶. اندازه‌های سازگاری و تفاوت‌های طراحی

1. **ارتفاع Text/Numeric Field** طبق قرارداد فعلی فیگما ۵۲ باقی می‌ماند. Button پیش‌فرض ۴۸/۴۰ است؛ `size="lg"` فقط سازگاری با `Dukani/Legacy/Button 52` است. یکسان‌سازی ارتفاع فیلد با دکمه، بخشی از همگام‌سازی زیرساخت نیست.
2. **Confirmation Overlay دسکتاپ** برای اقدام مخرب رنگ brand دارد ولی موبایل Danger دارد. در کد برای هر دو **Danger** گذاشته‌ایم (ui-guidelines: اقدام مخرب همیشه قرمز).

## ۷. چک‌لیست کامپوننت جدید با variant Viewport

- [ ] آیا DOM یا تعامل فرق می‌کند؟ اگر نه، فقط `desktop:` و توکن تراکم.
- [ ] اگر بله، Props مشترک ← دو Strategy بی‌state ← `createAdaptive` با نام مفهوم.
- [ ] Story در `stories/Responsive.stories.tsx` با نوار ابزار Viewport.
- [ ] تست a11y مشترک برای هر دو viewport (`<ViewportProvider forced="desktop">`).

## ۸. کامپوننت‌های فیگما که هنوز پیاده نشده‌اند

به ترتیب اولویت نسخهٔ اول:

- Autocomplete و Selection Overlay
- Record Card، Data Grid Row و Responsive Record List (کارت ↔ سطر جدول)
- Record List Controls، Pagination و Report Filter Drawer
- Status Chip، Key Value Row، Info Card و Toggle Row
- Linear Progress و Workflow Stepper؛ نشانگر بارگذاری پایه با `Spinner` موجود است.
- Seller Filter Bar، Cart Lines، کارت‌های Invoice/Result/Order و Timeline
- گونه‌های تخصصی باقی‌مانده؛ `Section` جمع‌شونده، `UploadArea` و `PageState` پایه در کد موجودند.

موارد آینده (خارج از MVP): الگوهای خدمات، Barcode Label و Financial Table.
