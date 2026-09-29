# تغییرات تأییدشده Seller-V2 — بازنگری 2.3.0

## بازنگری 2.4.1 — اعتبارسنجی ورود و کامپوننت عددی

شماره ایران ۱۱ رقمی با شروع 09؛ OTP شش رقم؛ اعتبارسنجی محلی در لحظه و اعتبارسنجی مستقل سرور؛ خطا با Danger قرمز. محل دقیق صفحه‌ها در figma-specification.md و قرارداد کامل در ui-guidelines.md است. فیگما نمونه طراحی است؛ اجرای اعتبارسنجی فرانت هنوز تسک توسعه است.

### محل صفحه‌ها در فیگما

| طرح | ورود موبایل | ورود OTP | موبایل نامعتبر | OTP ناقص |
|---|---|---|---|---|
| Seller-V2 | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-478) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-479) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-6105) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-6128) |
| Seller Desktop | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5341) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5342) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-9325) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-9351) |
| Customer Mobile | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-379) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-396) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-9728) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-9750) |
| Customer Desktop | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-3) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-34) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-9820) | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-9848) |

خانواده Numeric Field: `403:2`؛ نمونه‌های کامپوننت: `404:2`؛ Alert Danger موجود: `115:10`. ورود موبایل به‌عنوان نقطه شروع پروتوتایپ در هر چهار صفحه ثبت شد.

---


## تصمیم جاری ورود — بازنگری 2.4.0، 2026-09-26

طبق آخرین اصلاح مالک محصول، ورود فقط با **شماره موبایل و کد یک‌بارمصرف پیامکی** است. درخواست پیشین درباره شاهکار لغو شد: در ورود هیچ کد ملی، استعلام شاهکار یا حالت عدم تطابق مالکیت شماره وجود ندارد. کد ملی اختیاری در اطلاعات مالک فروشگاه، اگر در پروفایل حفظ شده باشد، شرط ورود نیست.

OTP فقط دسترسی به شماره را تأیید می‌کند؛ اثبات مالکیت قانونی سیم‌کارت، اعتبار مالی یا مالکیت اسناد قدیمی نیست. ثبت مشتری توسط فروشنده بدون ورود مشتری و بدون OTP باقی می‌ماند. پنل مشتری در نسخه 1.2 از همین قرارداد استفاده می‌کند؛ زمان انتشار آن به MVP منتقل نمی‌شود.

فناوری بک‌اند .NET قطعی و پیشنهاد دیتابیس PostgreSQL است. جزئیات در backend-architecture.md؛ قرارداد ورود در core-user-flows.md و flowcharts.md؛ صفحه‌ها در page-contracts.md و figma-specification.md. شماره 2.4.0 بازنگری سند است، نه تغییر شماره انتشار محصول.

---


[فیگما — Seller-V2](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=306-9365)

این نوبت: فروشگاه و اطلاعات اختیاری، مرجع‌های سفارش/فیش/کاتالوگ، نسیه و دریافت چک، شیوه فعالیت خرده/عمده و واحد دسته‌بندی تا موجودی. دریافت چک در۱.۰؛ پرداخت چک در۲.۰. فایل‌های زیر با نام قبلی اصلاح شده‌اند؛ ZIP ساخته نشده است. نسخه‌های محصول با شماره بازنگری اسناد یکی نیستند.

## فایل‌های تغییرکرده در این نوبت

- [figma-specification.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/03-design/figma-specification.md)
- [v1.0-seller-core.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v1.0-seller-core.md)
- [dukani-store-catalog-product-registration.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/06-domain/dukani-store-catalog-product-registration.md)
- [core-user-flows.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/04-flows/core-user-flows.md)
- [sprint-tasks.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/05-backlog/sprint-tasks.md)
- [epics-and-user-stories.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/05-backlog/epics-and-user-stories.md)
- [v2.0-finance-operations.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v2.0-finance-operations.md)
- [product-overview.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/01-product/product-overview.md)
- [product-roadmap.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/01-product/product-roadmap.md)
- [business-rules-and-gap-resolutions.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/06-domain/business-rules-and-gap-resolutions.md)
- [reports-and-metrics.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/01-product/reports-and-metrics.md)
- [accounting-treasury-expenses.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/01-product/accounting-treasury-expenses.md)
- [traceability-matrix.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/04-flows/traceability-matrix.md)
- [flowcharts.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/04-flows/flowcharts.md)
- [change-history.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/07-governance/change-history.md)
- [page-contracts.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/03-design/page-contracts.md)
- [final-decisions.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/07-governance/final-decisions.md)
- [state-transitions.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/04-flows/state-transitions.md)
- [figma-implementation-status.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/03-design/figma-implementation-status.md)

## فهرست کامل بسته قبلی با مسیرهای محفوظ

# مجموعه اسناد اصلاح‌شده دکانی —۲.۳.۰

این تحویل فایل‌های MD مستقل است؛ ZIP تازه ساخته نشده. نام فایل‌های قبلی حفظ و اسناد مکمل برای قواعد، صفحه‌ها، وضعیت‌ها و پایلوت اضافه شده‌اند.

[فیگمای موجود](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb) · [وضعیت واقعی تغییرهای فیگما](../03-design/figma-implementation-status.md)

ابتدا final-decisions، قواعد شکاف‌ها و core-user-flows؛ سپس flowcharts، قرارداد صفحه‌ها، backlog و فایل مستقل هر نسخه خوانده شوند.

## فایل‌های تغییرکرده و جدید

### 00-index


### 01-product

- [accounting-treasury-expenses.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/01-product/accounting-treasury-expenses.md)
- [dookani-project-blueprint.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/01-product/dookani-project-blueprint.md)
- [product-overview.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/01-product/product-overview.md)
- [product-roadmap.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/01-product/product-roadmap.md)
- [reports-and-metrics.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/01-product/reports-and-metrics.md)

### 03-design

- [figma-implementation-status.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/03-design/figma-implementation-status.md)
- [figma-specification.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/03-design/figma-specification.md)
- [page-contracts.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/03-design/page-contracts.md)
- [ui-guidelines.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/03-design/ui-guidelines.md)
- [us-cat-01-fast-product-entry-ux.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/03-design/us-cat-01-fast-product-entry-ux.md)
- [ux-guidelines.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/03-design/ux-guidelines.md)

### 04-flows

- [core-user-flows.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/04-flows/core-user-flows.md)
- [flowcharts.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/04-flows/flowcharts.md)
- [state-transitions.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/04-flows/state-transitions.md)
- [traceability-matrix.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/04-flows/traceability-matrix.md)

### 05-backlog

- [epics-and-user-stories.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/05-backlog/epics-and-user-stories.md)
- [sprint-tasks.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/05-backlog/sprint-tasks.md)

### 06-domain

- [business-rules-and-gap-resolutions.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/06-domain/business-rules-and-gap-resolutions.md)
- [dukani-admin-catalog-and-seeding.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/06-domain/dukani-admin-catalog-and-seeding.md)
- [dukani-store-catalog-product-registration.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/06-domain/dukani-store-catalog-product-registration.md)

### 07-governance

- [change-history.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/07-governance/change-history.md)
- [final-decisions.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/07-governance/final-decisions.md)
- [pilot-operations.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/07-governance/pilot-operations.md)
- [validation-report.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/07-governance/validation-report.md)

### 08-releases

- [future-network-and-extensions.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/future-network-and-extensions.md)
- [future-returns-and-corrections.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/future-returns-and-corrections.md)
- [v1.0-seller-core.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v1.0-seller-core.md)
- [v1.1-productivity.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v1.1-productivity.md)
- [v1.2-customer.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v1.2-customer.md)
- [v2.0-finance-operations.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v2.0-finance-operations.md)
- [v2.1-accounting.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v2.1-accounting.md)
- [v3.0-orders.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v3.0-orders.md)
- [v3.1-loyalty-credit.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v3.1-loyalty-credit.md)
- [v4.0-assistant.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/08-releases/v4.0-assistant.md)

### 09-reference

- [source-review-register.md](sandbox:/workspace/scratch/3ec923d432ed/deliverables/completed/dukani-documentation-v2.0/09-reference/source-review-register.md)

## دامنه و محدودیت

اسناد از اجرای فیگما و UAT نرم‌افزار جدا هستند. طرح موجود اصلاح شده؛ گیت‌ها و ریزحالت‌های هنوز بررسی‌نشده در گزارش وضعیت مشخص‌اند. معماری بازطراحی نشده و تاریخ عرضه تعهد نشده است.

## فایل‌های تغییرکرده در بازنگری 2.4.0

- [sprint-tasks.md](../05-backlog/sprint-tasks.md)
- [business-rules-and-gap-resolutions.md](../06-domain/business-rules-and-gap-resolutions.md)
- [final-decisions.md](../07-governance/final-decisions.md)
- [core-user-flows.md](../04-flows/core-user-flows.md)
- [page-contracts.md](../03-design/page-contracts.md)
- [state-transitions.md](../04-flows/state-transitions.md)
- [v1.0-seller-core.md](../08-releases/v1.0-seller-core.md)
- [flowcharts.md](../04-flows/flowcharts.md)
- [change-history.md](../07-governance/change-history.md)
- [figma-specification.md](../03-design/figma-specification.md)
- [epics-and-user-stories.md](../05-backlog/epics-and-user-stories.md)
- [figma-implementation-status.md](../03-design/figma-implementation-status.md)
- [v1.2-customer.md](../08-releases/v1.2-customer.md)
- [v3.1-loyalty-credit.md](../08-releases/v3.1-loyalty-credit.md)
- [frontend-architecture.md](../02-architecture/frontend-architecture.md)
- [devops-architecture.md](../02-architecture/devops-architecture.md)
- [backend-architecture.md](../02-architecture/backend-architecture.md)

### فایل‌های اصلاح‌شده در این بازنگری

- [sprint-tasks.md](../05-backlog/sprint-tasks.md)
- [backend-architecture.md](../02-architecture/backend-architecture.md)
- [core-user-flows.md](../04-flows/core-user-flows.md)
- [change-history.md](../07-governance/change-history.md)
- [frontend-architecture.md](../02-architecture/frontend-architecture.md)
- [page-contracts.md](../03-design/page-contracts.md)
- [figma-implementation-status.md](../03-design/figma-implementation-status.md)
- [figma-specification.md](../03-design/figma-specification.md)
- [ui-guidelines.md](../03-design/ui-guidelines.md)
- [ux-guidelines.md](../03-design/ux-guidelines.md)
