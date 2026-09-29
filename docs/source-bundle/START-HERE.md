# بسته آخرین اسناد بیزنس دکانی

تاریخ گردآوری: 2026-09-27 — این تاریخ نسخه بسته است، نه شماره انتشار محصول.

این ZIP آخرین نسخه ذخیره‌شده ۴۲ سند مرتبط را گردآوری می‌کند. فایل‌ها با نام و محتوای فعلی خود کپی شده‌اند؛ در این مرحله بازنویسی یا ادغام تازه‌ای انجام نشده است. شماره بازنگری داخل سندها ممکن است متفاوت باشد، چون در زمان‌های متفاوت اصلاح شده‌اند.

## از کجا شروع کنیم؟

1. محصول و نسخه‌ها: `01-product` و `08-releases`.
2. قواعد دامنه: `06-domain`؛ فلوها و وضعیت‌ها: `04-flows`.
3. طراحی و قرارداد صفحه‌ها: `03-design`؛ بک‌لاگ و تسک‌ها: `05-backlog`.
4. تصمیم‌ها و تاریخچه: `07-governance`؛ راهنمای پیشین: `00-index/README.md`.
5. معماری فرانت، بک و عملیات برای حفظ زمینه، به‌عنوان ضمیمه در `02-architecture` آمده‌اند.
6. منابع بازبینی و handoff قدیمی در `09-reference`، مرجع تصمیم جدید محسوب نمی‌شوند.
7. **خدمات، هزینه مواد مصرفی و سفارش جدید خریدار** در `10-pending-changes/dukani-services-customer-orders-handoff.md` ثبت شده‌اند. این موارد هنوز در همه اسناد اصلی یا فیگما اعمال نشده‌اند؛ این سند نیازهای صریح، پیشنهادها و تصمیم‌های باز را جدا می‌کند.

## فیگما

[لینک فایل فیگمای ارسال‌شده توسط مالک](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb/Dukani?node-id=19-2)

این بسته فایل باینری یا خروجی تصویری فیگما ندارد و در این نوبت تطبیق مجدد کل طرح زنده با اسناد انجام نشده است. لینک برای ادامه کار ثبت شده است؛ وضعیت اجرای قبلی طراحی در سند figma-implementation-status.md آمده است.

## دامنه و استفاده

- آخرین اصلاحات ثبت‌شده ورود OTP، ورودی عددی و اعتبارسنجی/Danger در اسناد مرتبط موجود است.
- نسخه‌های شماره‌دار قدیمی مجموعه قبلی که جایگزین شده‌اند، برای جلوگیری از دو مرجع متعارض در بخش جاری تکرار نشده‌اند.
- این بسته ادعای رفع همه تعارضات تاریخی نیست. تاریخچه یا متن مرجع داخل بعضی اسناد حفظ شده است؛ تصمیم جدیدتر و صریح مالک بر آن مقدم است.
- گزارش validation-report.md، گزارش بازبینی قبلی است؛ آزمون این بسته فقط کامل‌بودن ۴۲ فایل منتخب، برابری محتوای کپی‌ها با نسخه دریافت‌شده و سلامت ZIP است.
- فهرست زیر مسیر دقیق هر فایل را دارد. ارجاع‌های تاریخی به آرشیوهای بیرون از این بسته ممکن است همچنان نیازمند فایل اصلی باشند.

## فهرست اسناد

| فایل | وضعیت |
|---|---|
| [00-index/README.md](00-index/README.md) | سند جاری |
| [01-product/accounting-treasury-expenses.md](01-product/accounting-treasury-expenses.md) | سند جاری |
| [01-product/dookani-project-blueprint.md](01-product/dookani-project-blueprint.md) | سند جاری |
| [01-product/product-overview.md](01-product/product-overview.md) | سند جاری |
| [01-product/product-roadmap.md](01-product/product-roadmap.md) | سند جاری |
| [01-product/reports-and-metrics.md](01-product/reports-and-metrics.md) | سند جاری |
| [02-architecture/backend-architecture.md](02-architecture/backend-architecture.md) | ضمیمه معماری |
| [02-architecture/devops-architecture.md](02-architecture/devops-architecture.md) | ضمیمه معماری |
| [02-architecture/frontend-architecture.md](02-architecture/frontend-architecture.md) | ضمیمه معماری |
| [03-design/figma-implementation-status.md](03-design/figma-implementation-status.md) | سند جاری |
| [03-design/figma-specification.md](03-design/figma-specification.md) | سند جاری |
| [03-design/page-contracts.md](03-design/page-contracts.md) | سند جاری |
| [03-design/ui-guidelines.md](03-design/ui-guidelines.md) | سند جاری |
| [03-design/us-cat-01-fast-product-entry-ux.md](03-design/us-cat-01-fast-product-entry-ux.md) | سند جاری |
| [03-design/ux-guidelines.md](03-design/ux-guidelines.md) | سند جاری |
| [04-flows/core-user-flows.md](04-flows/core-user-flows.md) | سند جاری |
| [04-flows/flowcharts.md](04-flows/flowcharts.md) | سند جاری |
| [04-flows/state-transitions.md](04-flows/state-transitions.md) | سند جاری |
| [04-flows/traceability-matrix.md](04-flows/traceability-matrix.md) | سند جاری |
| [05-backlog/epics-and-user-stories.md](05-backlog/epics-and-user-stories.md) | سند جاری |
| [05-backlog/sprint-tasks.md](05-backlog/sprint-tasks.md) | سند جاری |
| [06-domain/business-rules-and-gap-resolutions.md](06-domain/business-rules-and-gap-resolutions.md) | سند جاری |
| [06-domain/dukani-admin-catalog-and-seeding.md](06-domain/dukani-admin-catalog-and-seeding.md) | سند جاری |
| [06-domain/dukani-store-catalog-product-registration.md](06-domain/dukani-store-catalog-product-registration.md) | سند جاری |
| [07-governance/change-history.md](07-governance/change-history.md) | سند جاری |
| [07-governance/final-decisions.md](07-governance/final-decisions.md) | سند جاری |
| [07-governance/pilot-operations.md](07-governance/pilot-operations.md) | سند جاری |
| [07-governance/validation-report.md](07-governance/validation-report.md) | سند جاری |
| [08-releases/future-network-and-extensions.md](08-releases/future-network-and-extensions.md) | سند جاری |
| [08-releases/future-returns-and-corrections.md](08-releases/future-returns-and-corrections.md) | سند جاری |
| [08-releases/v1.0-seller-core.md](08-releases/v1.0-seller-core.md) | سند جاری |
| [08-releases/v1.1-productivity.md](08-releases/v1.1-productivity.md) | سند جاری |
| [08-releases/v1.2-customer.md](08-releases/v1.2-customer.md) | سند جاری |
| [08-releases/v2.0-finance-operations.md](08-releases/v2.0-finance-operations.md) | سند جاری |
| [08-releases/v2.1-accounting.md](08-releases/v2.1-accounting.md) | سند جاری |
| [08-releases/v3.0-orders.md](08-releases/v3.0-orders.md) | سند جاری |
| [08-releases/v3.1-loyalty-credit.md](08-releases/v3.1-loyalty-credit.md) | سند جاری |
| [08-releases/v4.0-assistant.md](08-releases/v4.0-assistant.md) | سند جاری |
| [09-reference/dukani-business-flow-feature-page-task-gaps.md](09-reference/dukani-business-flow-feature-page-task-gaps.md) | مرجع بازبینی/تاریخی |
| [09-reference/dukani-figma-agent-handoff.md](09-reference/dukani-figma-agent-handoff.md) | مرجع بازبینی/تاریخی |
| [09-reference/source-review-register.md](09-reference/source-review-register.md) | مرجع بازبینی/تاریخی |
| [10-pending-changes/dukani-services-customer-orders-handoff.md](10-pending-changes/dukani-services-customer-orders-handoff.md) | پیشنهادها و نیازهای هنوز ادغام‌نشده |
