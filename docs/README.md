# اسناد فرانت‌اند دکانی

> 2026-10-15: [قواعد مشترک لیست، فیلتر، فرم، حذف، مودال، اسکن و جزئیات](../../documents/spec/patterns/README.md) و [**راهنمای توسعه‌دهنده**](../../documents/frontend/developer-guide.md) (هر چیز را چطور بسازیم). زیرساخت (`DataGrid`، `useAppList`، `FilterArea`، `FormActions`، `useConfirmAction`، `ScanArea`/`useScanIntake`، `ChartFrame`) پیاده شده است؛ وضعیت اجرا و مهاجرت صفحات: [وضعیت اجرا](../../documents/spec/patterns/implementation-status.md).


## ترتیب خواندن

1. [`architecture/frontend-architecture.md`](architecture/frontend-architecture.md) — معماری، ماژول‌ها، مسیرها و قرارداد با بک‌اند (نسخه ۱.۲)
2. [`business/orders-services-membership.md`](business/orders-services-membership.md) — قواعد تازه: خدمت، پول Decimal، عضویت، سفارش و پرینت (بازنگری 2.5.0)
3. [`backend/change-requests.md`](backend/change-requests.md) — تغییرهای لازم در بک‌اند (BCR-01 تا BCR-13)
4. [`../deploy/README.md`](../deploy/README.md) — Docker، nginx و متغیرهای محیطی
5. READMEهای Featureها: `packages/features/*/README.md`
6. [`architecture/grid-columns.md`](architecture/grid-columns.md) — الگوی قابل‌توسعهٔ ستون‌های گرید، استثنا برای جلوگیری از پیچیدگی، ثبات ترجمه و معیار حفظ UI و کارایی؛ React Compiler فعلاً غیرفعال است.

## مرجع‌ها

| پوشه | محتوا | وضعیت |
|---|---|---|
| [`reference/backend/`](reference/backend/) | سند معماری، مدل دامنه، endpointها، دیتابیس، راهنمای پیاده‌سازی، `openapi.json` و PROGRESS بک‌اند (کامیت `b12df9c`) | snapshot فقط‌خواندنی و تاریخی معماری و مدل دامنه. قرارداد HTTP جاری و ورودی تولید `packages/shared/contracts` در [`backend/openapi.json`](backend/openapi.json) است |
| [`reference/product/`](reference/product/) | ui-guidelines، figma-specification، flowcharts، figma-implementation-status، یادداشت تغییرات 2.4.1 | با قواعد بازنگری 2.5.0 اصلاح شده‌اند |
| [`source-bundle/`](source-bundle/START-HERE.md) | **بستهٔ کامل اسناد بیزنس مالک** (گردآوری 2026-09-27، ۴۲ سند): محصول، نسخه‌ها (`08-releases`)، قواعد دامنه، فلوها و وضعیت‌ها، page-contracts، ui/ux-guidelines، بک‌لاگ و اپیک‌ها، تصمیم‌های نهایی، و `10-pending-changes` | کپی دقیق و فقط‌خواندنی (هش‌ها با `PACKAGE-MANIFEST.md` برابرند). از `START-HERE.md` شروع کنید. **`02-architecture/` این بسته فقط زمینه است و معیار نیست:** معیار معماری بک‌اند `reference/backend/` و معیار معماری فرانت `architecture/frontend-architecture.md` است. `ui-guidelines` و `ux-guidelines` این بسته (2026-09-29، انتخاب تاریخ موبایل/دسکتاپ) از نسخهٔ `reference/product/` تازه‌ترند |
| [`architecture/responsive-proposal.md`](architecture/responsive-proposal.md) | پیشنهاد مالک برای یکپارچه‌سازی کامپوننت‌های موبایل/دسکتاپ | پاسخ و پیاده‌سازی در [`responsive-components.md`](architecture/responsive-components.md) |

## اولویت در تعارض

1. بک‌اند برای مسیر API، DTO، enum، کد خطا، مجوز و مدل دامنه.
2. سند کسب‌وکاری تازه‌تر برای قاعده؛ تفاوت آن با بک‌اند در BCR ثبت و در فرانت فقط در Adapter پنهان می‌شود.
3. فیگما برای ظاهر؛ page-contracts و ui-guidelines برای رفتار صفحه.

در خود بستهٔ اسناد، تصمیم جدیدتر و صریح مالک (`07-governance/final-decisions.md`، `docs/business/`) بر متن قدیمی‌تر مقدم است؛ `09-reference` فقط سابقه است و `10-pending-changes` هنوز همه‌جا اعمال نشده.

## فیگما

فایل: https://www.figma.com/design/UYer2tdXokR61KYthMtPfb

| صفحه | ID | کاربرد در فاز فعلی |
|---|---|---|
| 00 — Foundations | `13:2` | توکن‌ها |
| 02 — Components | `19:2` | ui-kit |
| 03 — Product Entry Components | — (nodeها: `403:2`، `404:2`، `115:10`) | ui-kit |
| 11 — Customer App | `235:2257` | اپ مشتری (ناوبری، خریدها، بدهی، ۳.۰) |
| 13 — Landing | `274:2` | لندینگ |
| 16 — Seller Desktop | `306:3278` | فریم‌های دسکتاپ فروشنده |
| 17 — Seller-V2 | `306:9365` | اپ فروشنده موبایل |
| 18 — Admin | `307:425` | پنل ادمین (دسکتاپ) |
| 20 — نسخه 1.2 · مشتری دسکتاپ | `310:2` | اپ مشتری دسکتاپ |
| 20b — نسخه 1.2 · مشتری موبایل | `310:378` | اپ مشتری موبایل |

صفحه‌های اولویت‌دار نسخه‌های اول: 00، 02، 03، 16، 17، 18، 20، 20b. قواعد موبایل/دسکتاپ: [`architecture/responsive-components.md`](architecture/responsive-components.md).
