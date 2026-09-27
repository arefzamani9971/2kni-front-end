# اسناد فرانت‌اند دکانی

## ترتیب خواندن

1. [`architecture/frontend-architecture.md`](architecture/frontend-architecture.md) — معماری، ماژول‌ها، مسیرها و قرارداد با بک‌اند (نسخه ۱.۱)
2. [`business/orders-services-membership.md`](business/orders-services-membership.md) — قواعد تازه: خدمت، پول Decimal، عضویت، سفارش و پرینت (بازنگری 2.5.0)
3. [`backend/change-requests.md`](backend/change-requests.md) — تغییرهای لازم در بک‌اند (BCR-01 تا BCR-12)

## مرجع‌ها

| پوشه | محتوا | وضعیت |
|---|---|---|
| [`reference/backend/`](reference/backend/) | سند معماری، مدل دامنه، endpointها، دیتابیس، راهنمای پیاده‌سازی، `openapi.json` و PROGRESS بک‌اند (کامیت `b12df9c`) | کپی فقط‌خواندنی؛ **معیار API و مدل دامنه**. `openapi.json` ورودی تولید `packages/shared/contracts` است |
| [`reference/product/`](reference/product/) | ui-guidelines، figma-specification، flowcharts، figma-implementation-status، یادداشت تغییرات 2.4.1 | با قواعد بازنگری 2.5.0 اصلاح شده‌اند |

## اولویت در تعارض

1. بک‌اند برای مسیر API، DTO، enum، کد خطا، مجوز و مدل دامنه.
2. سند کسب‌وکاری تازه‌تر برای قاعده؛ تفاوت آن با بک‌اند در BCR ثبت و در فرانت فقط در Adapter پنهان می‌شود.
3. فیگما برای ظاهر؛ page-contracts و ui-guidelines برای رفتار صفحه.

## فیگما

فایل: https://www.figma.com/design/UYer2tdXokR61KYthMtPfb

| صفحه | ID | کاربرد در فاز فعلی |
|---|---|---|
| 00 — Foundations | `13:2` | توکن‌ها |
| 02 — Components | — (لینک لازم است) | ui-kit |
| 03 — Product Entry Components | — (nodeها: `403:2`، `404:2`، `115:10`) | ui-kit |
| 11 — Customer App | `235:2257` | اپ مشتری (ناوبری، خریدها، بدهی، ۳.۰) |
| 13 — Landing | `274:2` | لندینگ |
| 17 — Seller-V2 | `306:9365` | اپ فروشنده موبایل |
| 20b — نسخه 1.2 · مشتری موبایل | `310:378` | اپ مشتری موبایل |
