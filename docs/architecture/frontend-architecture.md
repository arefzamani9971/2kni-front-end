# معماری و ماژول‌بندی فرانت‌اند دکانی

> نسخه ۱.۱ — ۱۴۰۵/۰۷/۰۵ (2026-09-27). جایگزین نسخه ۱.۰ (۱۴۰۵/۰۷/۰۴).
> مبنا: **بک‌اند** (کد و اسناد در [`../reference/backend/`](../reference/backend/)، کامیت `b12df9c`)، تصمیم‌های کسب‌وکاری [`../business/orders-services-membership.md`](../business/orders-services-membership.md)، اسناد محصول [`../reference/product/`](../reference/product/) و فایل فیگما `UYer2tdXokR61KYthMtPfb`.

## فهرست

0. منابع مرجع و اولویت
1. خلاصه تصمیم‌ها و تغییرات نسبت به ۱.۰
2. نقشه اپ‌ها و ساختار Monorepo
3. Design System و ui-kit
4. قرارداد با بک‌اند
5. ماژول‌های فروشنده
6. ماژول‌های مشتری و لندینگ
7. ماژول‌های آینده
8. مسیرها
9. دغدغه‌های مشترک
10. فازبندی و موارد باز
- پیوست الف — فریم‌های Seller-V2 (صفحه 17)
- پیوست ب — فریم‌های مشتری موبایل (صفحه‌های 20b و 11)
- پیوست ج — فریم لندینگ (صفحه 13)

---

## ۰. منابع مرجع و اولویت

| موضوع | مرجع قطعی | توضیح |
|---|---|---|
| مسیر API، DTO، enum، کد خطا، مجوز، مدل دامنه | **بک‌اند**: `openapi.json`، `endpoints.md`، `domain-model.md` (۱۰۹ Entity، ۳۸۸ DTO، ۸۷ enum، ۱۲ ماژول) | DTOها فقط از `openapi.json` تولید می‌شوند؛ نوشتن دستی DTO ممنوع است |
| قاعده کسب‌وکار | اسناد BIZ و F (بازنگری 2.4.1) + [`orders-services-membership.md`](../business/orders-services-membership.md) (2.5.0) | در تعارض، سند تازه‌تر حاکم است |
| تفاوت قاعده تازه با بک‌اند فعلی | [`change-requests.md`](../backend/change-requests.md) (BCR) | فرانت قرارداد فعلی API را مصرف می‌کند و تفاوت را فقط در Adapter همان ماژول نگه می‌دارد |
| ظاهر و رفتار صفحه | فیگما (صفحات 00، 02، 03، 17، 11، 20b، 13) + `ui-guidelines.md` + `page-contracts.md` | مقدار توکن از متغیر فیگما؛ رفتار از page-contracts |

---

## ۱. خلاصه تصمیم‌ها

| موضوع | تصمیم | دلیل |
|---|---|---|
| Monorepo | pnpm workspaces + Nx | تگ‌های `scope`/`type`، `@nx/enforce-module-boundaries`، `nx affected` در CI |
| فریمورک | Next.js (App Router) + TypeScript strict | SSR برای لندینگ و ویترین، `next/font/local` برای IRANSansX |
| اپ‌های فاز فعلی | `seller`، `customer`، `landing` — **فقط موبایل** (مرجع ۳۹۰×۸۴۴)؛ لندینگ ریسپانسیو | دستور مالک: فعلاً صفحات موبایل |
| الگوی رندر | Shell با Server Component، صفحات عملیاتی Client | دوربین، IndexedDB و PWA سمت کلاینت‌اند |
| استایل | Tailwind CSS + CSS Variables با پیشوند `--dukani-*` | زنجیره توکن فیگما ← CSS var ← preset |
| Storybook | Storybook 8 برای `ui-kit` و Screenهای Feature | مستند کامپوننت‌ها و نگاشت نام فیگما |
| Server State | TanStack Query پشت Facade `useAppQuery` / `useAppMutation` | جداسازی کتابخانه از Feature |
| فرم | React Hook Form + zod پشت `useAppForm` | اعتبارسنجی لحظه‌ای ورودی عددی |
| HTTP | Port `HttpClient` + Adapter fetch + Decoratorها | Auth، Idempotency، Retry، نگاشت خطا، Log |
| **مسیر API** | **مسیر بک‌اند**: `/api/v1/stores/{storeId}/…`؛ بدون هدر `X-Store-Id` | بک‌اند معیار است |
| **DTO** | `openapi-typescript` از `docs/reference/backend/openapi.json` | تغییر بک‌اند در زمان build دیده شود |
| **پول** | **Decimal**، یک واحد، بدون تبدیل ریال/تومان؛ برچسب «تومان» فقط در نمایش | BIZ-MNY-01؛ تا BCR-01 Adapter مقدار `int64` را بدون تقسیم می‌خواند |
| **مجوز** | ۱۹ مجوز `StorePermission` بک‌اند + `GET /api/v1/permissions` | بک‌اند معیار است |
| **مدل دامنه** | `domain-model.md` بک‌اند (نسخه کامل) | نسخه ۶۲ Entity قدیمی کنار گذاشته شد |
| نشست | BFF در Next.js: Refresh Token در کوکی `httpOnly`، Access Token در حافظه | Refresh چرخشی بک‌اند در معرض XSS نباشد |
| جهت و زبان | `fa`، RTL، CSS logical properties، تقویم شمسی، Asia/Tehran | ui-guidelines §14 |
| تست | Vitest، Testing Library، MSW، Storybook (test-runner + a11y)، Playwright | frontend-architecture §13 |
| داده تا بالا آمدن API | MSW با fixture تولیدشده از OpenAPI؛ تعویض با متغیر `NEXT_PUBLIC_API_MODE=mock\|live` | بک‌اند هنوز build و مستقر نشده |

### تغییرات نسبت به نسخه ۱.۰

| مورد | ۱.۰ | ۱.۱ |
|---|---|---|
| فروشگاه در درخواست | Decorator `withStore` و هدر `X-Store-Id` | شناسه در مسیر: `storeApi(storeId)` |
| پول | «عدد صحیح ریال، نمایش تومان با تقسیم ۱۰» | Decimal یک‌واحدی؛ بدون تقسیم |
| مجوزها | ۹ مجوز | ۱۹ مجوز بک‌اند |
| مدل دامنه | ۶۲ Entity، ۱۰ ماژول | ۱۰۹ Entity، ۱۲ ماژول (Ordering و CustomerPortal) |
| اپ‌ها در فاز فعلی | فقط فروشنده | فروشنده + مشتری (۱.۲) + لندینگ؛ همه موبایل |
| خدمت | — | نوع قلم «خدمت»، بارکد شرط فاکتور نیست |
| سفارش | ۴ روش تحویل | ۲ شیوه دریافت + پیش‌سفارش + سفارش خدماتی پرینت |
| استعلام عملیات | `GET /operations/{id}` | `GET /api/v1/stores/{storeId}/operations/{operationId}` (`OperationStatusDto`) |

---

## ۲. نقشه اپ‌ها و ساختار Monorepo

| اپ | صفحه فیگما | نسخه محصول | Theme | وضعیت |
|---|---|---|---|---|
| `apps/seller` | 17 (موبایل)، 16 (دسکتاپ) | ۱.۰ | `shop` (Teal) | **فاز فعلی — موبایل** |
| `apps/customer` | 20b و 11 (موبایل)، 20 (دسکتاپ)؛ ویترین 24 و 25 | ۱.۲ و ۳.۰ | `customer` (Indigo) | **فاز فعلی — موبایل ۱.۲**؛ ۳.۰ پشت ReleaseGate |
| `apps/landing` | 13 | ۱.۰ (F64) | `shop` | **فاز فعلی — ریسپانسیو** (فریم فقط دسکتاپ است؛ موبایل از همان بخش‌ها چیده می‌شود) |
| `apps/admin` | 18، 10 | ۱.۰ (F29، F30، F75) | `admin` (Slate) | فاز بعد |
| `apps/*-e2e` | — | — | — | Playwright برای هر اپ |

دامنه‌ها از متغیر محیطی خوانده می‌شوند (پیشنهاد: `2kni.ir` لندینگ، `app.2kni.ir` فروشنده، `my.2kni.ir` مشتری، `api.2kni.ir` API).

### درخت مخزن

```text
2kni-front-end/
├─ apps/
│  ├─ seller/            Next.js — پنل فروشنده
│  │  ├─ src/app/        Routing و Layout (فقط ترکیب)
│  │  ├─ src/composition/ container.ts، module registry، nav
│  │  └─ src/widgets/    ترکیب چند Feature در یک صفحه (خانه)
│  ├─ customer/          Next.js — پنل مشتری و ویترین
│  ├─ landing/           Next.js — لندینگ
│  └─ seller-e2e/ customer-e2e/ landing-e2e/
├─ packages/
│  ├─ shared/
│  │  ├─ domain/         Money، Decimal، Quantity، Unit، Barcode، IranMobile، OtpCode، JalaliDate، Percent،
│  │  │                  OperationId، شناسه‌ها، ItemKind، Permission، ProductRelease، AppEvent، AppError، Result
│  │  ├─ contracts/      تایپ‌های تولیدشده از openapi.json + helperهای CursorPage و ProblemDetails
│  │  ├─ http/           HttpClient، fetch adapter، Decoratorها، storeApi/customerApi/shopApi
│  │  ├─ data/           useAppQuery / useAppMutation + TanStack adapter + queryKeys
│  │  ├─ platform/       EventBus، Logger، Analytics، Storage، DraftStore، I18n، DateService، NetworkStatus،
│  │  │                  Share/Print، ReleaseGate، Session، ContainerContext
│  │  ├─ scanner/        Facade دوربین و بارکد
│  │  ├─ design-tokens/  خروجی متغیرهای فیگما ← CSS vars + Tailwind preset
│  │  ├─ ui-kit/         Primitive، Pattern، Overlay، Shell؛ تنها محل import کتابخانه‌های UI
│  │  └─ testing/        fixtureها (FIXTURE-01)، MSW handlers، container جعلی
│  ├─ features/          Bounded Contextها؛ هرکدام domain/application/infrastructure/ui
│  │  ├─ auth/ (scope:shared)
│  │  ├─ seller: store/ staff-access/ catalog/ products/ product-entry/ bulk-import/ inventory/
│  │  │          purchasing/ sales/ invoices/ customers/ receivables/ cheques/ reports/
│  │  │          action-center/ data-export/ support/
│  │  ├─ customer: buyer-account/ buyer-invoices/ buyer-settlements/ buyer-claims/ buyer-profile/
│  │  ├─ landing: marketing/
│  │  └─ (آینده، فقط رزرو) orders/ storefront-settings/ memberships/ storefront/ buyer-cart/ checkout/
│  │     buyer-orders/ print-order/ admin-*/ finance-*/ accounting/ loyalty/ assistant/
│  └─ config/            tsconfig.base، eslint (boundaries)، tailwind preset، vitest، storybook
├─ docs/                 اسناد (همین پوشه)
├─ tools/                generator ساخت Feature، sync توکن، تولید contracts
└─ nx.json  pnpm-workspace.yaml  tsconfig.base.json
```

### ساختار داخلی هر Feature

```text
packages/features/sales/
├─ src/domain/            cart.ts، cart-line.ts (ItemKind)، discount.rules.ts، checkout.rules.ts
├─ src/application/
│  ├─ ports/              sale.repository.ts، cart-draft.store.ts
│  └─ use-cases/          add-line.ts، apply-discount.ts، commit-sale.ts، resolve-unknown-sale.ts
├─ src/infrastructure/    sale.mapper.ts (DTO ↔ domain، پول)، http-sale.repository.ts، idb-cart-draft.store.ts
├─ src/ui/
│  ├─ hooks/ components/ screens/ presentation/
├─ src/module.ts          createSalesModule(deps)
└─ src/index.ts           Public API
```

`app/` در اپ فقط Screen را mount می‌کند؛ مثلاً `app/s/[storeId]/sales/new/page.tsx` تنها `<SaleScreen />` را رندر می‌کند.

### تگ‌های Nx و قواعد مرز

| تگ | روی | مجاز به وابستگی به |
|---|---|---|
| `type:app` | `apps/*` | همه |
| `type:feature` | `packages/features/*` | `type:shared`، `type:ui-kit` |
| `type:ui-kit` | `ui-kit` | `design-tokens`، `domain`، `platform` |
| `type:shared` | domain، contracts، http، data، platform، scanner، design-tokens | فقط `type:shared` |
| `scope:seller` / `scope:customer` / `scope:landing` / `scope:admin` / `scope:shared` | Feature و اپ | اپ هر scope فقط Featureهای همان scope و `shared` |

- Feature هرگز Feature دیگری را import نمی‌کند.
- `no-restricted-imports` برای `@tanstack/react-query`، `react-hook-form`، `@radix-ui/*`، `vaul`، `@zxing/*`، `recharts`، `dexie`، `big.js` فعال است و فقط در پوشه `adapters` پکیج صاحب خاموش می‌شود.
- ارتباط بین Featureها: رویداد تایپ‌شده `EventBus` (`sale.committed`، `product.created`، `customer.created`)، شناسه‌های مشترک در `shared/domain`، یا ترکیب در `widgets`.

---

## ۳. Design System و ui-kit

### زنجیره توکن

`Primitive (teal/700)` ← `Semantic (color/bg/brand)` ← `CSS var (--dukani-color-bg-brand)` ← `Tailwind (bg-brand)` ← `Component (Button variant=primary)`

| Collection فیگما | خروجی کد | نکته |
|---|---|---|
| Dukani/Primitives (۳۰ رنگ) | `primitives.css` — فقط منبع alias | در Feature و ui-kit مستقیم مصرف نمی‌شود |
| Dukani/Semantic (۳۴ رنگ × ۳ Mode) | `data-theme="shop\|customer\|admin"` روی `<html>` | bg، text، border، icon، action، status، overlay |
| Dukani/Size (۲۶) | `--dukani-spacing-*` (۰، ۴، ۸، ۱۲، ۱۶، ۲۴، …)، `--dukani-radius-sm/md/lg/full` (۸/۱۲/۱۶/۹۹۹)، `--dukani-control-*`، `--dukani-icon-*`، `--dukani-touch-min` (۴۴)، `--dukani-stroke-default` (۱) | مرجع Radius متغیر فیگماست، نه جدول ۶/۱۰/۱۴ ui-guidelines |
| Text Styles (۱۳) | `text-heading-xl` (24/36 Bold)، `heading-l` (20/30 DemiBold)، `heading-m` (18/28 DemiBold)، `body-l` (16/26)، `body-m` (14/22)، `label-m` (14/22 Medium)، `label-s` (12/18 Medium)، … | IRANSansX با ارقام فارسی D4؛ Numeric با tabular-nums |
| Effect Styles (۳) | `shadow-subtle/medium/strong` | فقط Overlay و Floating action |

مقادیر خوانده‌شده از فیگما (Mode `shop`): `bg/canvas #f8fafc`، `bg/surface #ffffff`، `bg/brand #0f766e`، `bg/brand-subtle #f0fdfa`، `text/primary #0f172a`، `text/secondary #475569`، `text/brand #0f766e`، `icon/default #475569`، `border/default #e2e8f0`، `status/success #047857`، `status/warning #b45309`، `status/danger #b91c1c`. بقیه با اسکریپت `tools/sync-tokens` از فیگما خوانده و commit می‌شوند.

### لایه‌های ui-kit

منبع اصلی کامپوننت‌ها صفحه **03 — Product Entry Components** است (Numeric Field `403:2`، نمونه‌ها `404:2`، Alert Danger `115:10`) و صفحه 02 چهار کامپوننت پایه دارد. هر کامپوننت Story، تست دسترس‌پذیری و نام فیگمای معادل در Storybook دارد.

| لایه | کامپوننت‌ها | منبع فیگما |
|---|---|---|
| Primitive | Button (Primary/Secondary/Text/Danger × Default/Disabled/Loading × sm/md/lg)، IconButton، Link | 02 `Dukani/Button`، 03 `Button` |
| Primitive | TextField (Empty/Filled/Focused/Error/Disabled)، BarcodeField، SearchBox | 02 `Dukani/Field`، 03 `Text Field` |
| Primitive | DigitInput: IranMobileField، OtpField، IntegerField (Kind × State = ۱۵) | 03 `Numeric Field` |
| Primitive | DecimalQuantityField، MoneyField (Decimal، بدون تبدیل)، PercentField | ui-guidelines §20 |
| Primitive | Chip، StatusBadge، Badge | 03 `Chip`، `Status Badge` |
| Primitive | Alert (Info/Warning/Danger)، Toast، InlineError | 03 `Alert` |
| Primitive | Checkbox، Radio، Switch، Tabs، SegmentedControl، Skeleton، Spinner، Divider | ui-guidelines |
| Overlay | Dialog، BottomSheet، ConfirmDialog، QuickActionSheet | 03 `Quick Action Sheet` |
| Pattern | AppBar، BottomNavigation (فروشنده: خانه، کالاها، مشتریان، گزارش‌ها، بیشتر؛ مشتری: خانه، خریدها، سفارش‌ها، حساب من)، ActionRow | 02/03 `App Bar`، `Bottom Navigation`؛ 11 `Customer Bottom Navigation` |
| Pattern | MetricCard، ComparisonCard، CoverageBanner | 03 `Metric Card` |
| Pattern | ProductDataRow، ProductResultCard، SuggestionItem، **ItemKindBadge** (کالا/خدمت) | 02 `ProductCard`، 03 `Product Data Row`، `Suggestion Item` |
| Pattern | PaymentMethodRow، StockMovementRow، LedgerEntryRow، DebtRow، TimelineRow | 03 |
| Pattern | Combobox، EntityPicker، CategoryPicker، BrandPicker، UnitSelector | ui-guidelines §22 |
| Pattern | DateField و DateRangePicker شمسی، FilterChips، PeriodSwitcher | ui-guidelines §21 |
| Pattern | DataList، KeyValueList، SummaryCard/InvoiceSummary، ResultScreen، StickyActionBar، FileUploadField | Seller-V2 و 20b |
| Pattern | ScannerOverlay، CameraPermissionState، ScanFeedback | Seller-V2 |
| State | PageState: Loading، Empty، Error، Offline، Permission، Partial، Stale، Unknown-result، NotReleased | Seller-V2 + page-contracts |
| Shell | AuthShell، TabsShell، FlowShell، FullscreenShell | Seller-V2، 20b |
| Marketing | LandingNav، Hero، FeatureCard، AudienceCard، TrustBand، Footer | 13 |

کتابخانه‌های زیرین (فقط داخل `ui-kit/src/adapters`): Radix UI (Dialog/Tabs/Popover/Checkbox/Radio/Switch)، vaul (BottomSheet)، cva (variant)، Recharts (Chart).

---

## ۴. قرارداد با بک‌اند

### پایه‌های مسیر

| گروه | مسیر | Helper فرانت | احراز هویت |
|---|---|---|---|
| هویت | `/api/v1/auth/*`، `/api/v1/me/*` | `api` | OTP → JWT |
| فروشگاه‌های من | `/api/v1/stores`، `/api/v1/invitations/*`، `/api/v1/permissions`، `/api/v1/store-types`، `/api/v1/units` | `api` | JWT |
| فروشنده (store-scoped) | `/api/v1/stores/{storeId}/…` | `storeApi(storeId)` | JWT + عضویت (`StoreAccessFilter`) |
| مشتری | `/api/v1/customer/…` | `customerApi` | JWT (بدون فروشگاه جاری) |
| ویترین | `/api/v1/shop/{storeId}/…`، `/api/v1/shop/by-code/{code}` | `shopApi(storeId)` | مرور بی‌نام؛ سبد و سفارش با JWT |
| عمومی | `/api/v1/public/invoices/{token}` | `publicApi` | بی‌نام |
| ادمین | `/api/v1/admin/…` | `adminApi` | نقش `platform.admin` یا `platform.catalog_reviewer` |

### قراردادهای مشترک

| موضوع | قرارداد بک‌اند | پیاده‌سازی فرانت |
|---|---|---|
| JSON | camelCase، enumها رشته | تایپ‌های `openapi-typescript`؛ برچسب فارسی enum در `ui/presentation` |
| صفحه‌بندی | `CursorPage<T> { items, nextCursor, totalCount? }`، `limit ≤ 100` | `useAppInfiniteQuery` |
| هم‌زمانی | `version` (uint) در DTO؛ `ExpectedVersion`/`Version` در Request | Mapper نسخه را نگه می‌دارد؛ `409 VERSION_CONFLICT` ← `Conflict` |
| ثبت قطعی | هدر `Idempotency-Key` (GUID) روی actionهای ♻ | `OperationId` هنگام ساخت پیش‌نویس، ذخیره در همان پیش‌نویس |
| استعلام نتیجه | `GET /api/v1/stores/{storeId}/operations/{operationId}` ← `OperationStatusDto { status, resultType, resultId, response, errorCode }` | حالت `unknown` ← `querying`؛ در مسیرهای مشتری تکرار همان درخواست با همان کلید (بک‌اند پاسخ ذخیره‌شده را برمی‌گرداند) |
| خطا | ProblemDetails + `code` پایدار؛ ۴۰۰ `VALIDATION_FAILED` با `errors` فیلدی | `withErrorMapping` ← `AppError` |
| نسخه محصول | `FEATURE_NOT_RELEASED`؛ `ProductRelease` (100، 110، 120، 200، 210، 300، 310، 400) | `ReleaseGate` با همان مقادیر |
| پول | فعلاً `int64` با نام `…Rials` | Mapper: بدون تقسیم به `Money` Decimal (BCR-01) |
| مقدار | `decimal` در واحد پایه | `Quantity` Decimal |
| بارکد، موبایل، OTP | رشته | هرگز Number |

### نگاشت کدهای خطا

| کد بک‌اند | `AppError.kind` | نمایش |
|---|---|---|
| `VALIDATION_FAILED`، `MOBILE_INVALID`، `OTP_INVALID`، `QUANTITY_INVALID`، `BARCODE_INVALID`، `PRODUCTION_AFTER_EXPIRY`، `REQUIRED_ATTRIBUTE_MISSING`، `FILE_TOO_LARGE`، `FILE_TYPE_NOT_ALLOWED` | `Validation` | کنار فیلد + خلاصه فرم |
| `UNAUTHORIZED`، `SESSION_REVOKED`، `REFRESH_TOKEN_INVALID` | `Unauthorized` | Refresh یک‌باره؛ در شکست خروج و بازگشت به ورود با حفظ مقصد |
| `USER_BLOCKED` | `Blocked` | صفحه پشتیبانی |
| `PERMISSION_DENIED`، `STORE_ACCESS_DENIED` | `Permission` | علت و بازگشت؛ پیش‌نویس حفظ |
| `NOT_FOUND` | `NotFound` | حالت خالی متناسب |
| `VERSION_CONFLICT`، `ORDER_VERSION_STALE`، `OPERATION_IN_PROGRESS`، `PRICE_CHANGED` | `Conflict` | «بازبینی دوباره» با تفاوت |
| `IDEMPOTENCY_KEY_REQUIRED` | `Bug` | فقط لاگ؛ هرگز به کاربر نرسد |
| `OTP_WRONG`، `OTP_EXPIRED`، `OTP_RATE_LIMITED`، `OTP_SEND_FAILED` | `BusinessRule` | حالت‌های otp-wrong / expired / limited / send-failed |
| `STOCK_NOT_ENOUGH`، `CUSTOMER_REQUIRED_FOR_CREDIT`، `PAYMENT_EXCEEDS_TOTAL`، `SETTLEMENT_EXCEEDS_DEBT`، `ALLOCATION_MISMATCH`، `DISCOUNT_EXCEEDS_AMOUNT`، `PRODUCT_INACTIVE`، `TITLE_DUPLICATE`، `BARCODE_DUPLICATE`، `UNIT_DIMENSION_MISMATCH`، `INVALID_STATE_TRANSITION`، `PURCHASE_CANCEL_BLOCKED`، `CORRECTION_BLOCKED`، `CUSTOMER_MOBILE_DUPLICATE`، `LAST_OWNER`، `INVITATION_CLOSED`، `IMPORT_DUPLICATE_FILE`، `IMPORT_HAS_ERRORS`، `STOREFRONT_CLOSED`، `SLOT_FULL`، `RESERVATION_EXPIRED`، `RECEIPT_REQUIRED` | `BusinessRule` | Alert Danger با اقدام اصلاح (مثلاً «ثبت سریع موجودی») |
| `FEATURE_NOT_RELEASED` | `NotReleased` | PageState «به‌زودی» |
| بدون پاسخ پس از ارسال | `Unknown` | استعلام همان عملیات |
| بدون شبکه | `Offline` | بنر ثابت؛ ثبت قطعی غیرفعال |
| 5xx | `Server` | تلاش دوباره با حفظ فرم |

متن فارسی هر کد در `i18n/fa/errors.json` با کلید `errors.<CODE>` است؛ اگر کلید نبود، `detail` خود ProblemDetails نمایش داده می‌شود.

### مجوزهای فروشگاه (۱۹، از `StorePermission`)

| کلید | عنوان | پیش‌فرض کارمند |
|---|---|---|
| `sale.cash` | فروش نقدی | ✓ |
| `sale.credit` | فروش نسیه | |
| `sale.discount` | تخفیف در فروش | |
| `sale.price_override` | تغییر قیمت هنگام فروش | |
| `sale.correct` | اصلاح و ابطال فاکتور | |
| `debt.settle` | ثبت تسویهٔ بدهی | |
| `product.manage` | ثبت و ویرایش کالا | ✓ |
| `price.change` | تغییر قیمت کالا | |
| `stock.view` | مشاهدهٔ موجودی | ✓ |
| `stock.adjust` | تعدیل موجودی | |
| `purchase.manage` | ثبت خرید | |
| `purchase.correct` | اصلاح و ابطال خرید | |
| `customer.manage` | ثبت و ویرایش مشتری | ✓ |
| `customer.merge` | ادغام مشتری | |
| `report.financial` | گزارش‌های مالی | |
| `data.export` | خروجی اطلاعات | |
| `staff.manage` | مدیریت کارکنان | |
| `store.settings` | تنظیمات فروشگاه | |
| `order.manage` | مدیریت سفارش‌های مشتریان (۳.۰) | |

- مالک (`MemberRole.Owner`) همه را دارد. مجوزهای کاربر از `StoreDto.myRole` و `StoreDto.myPermissions` می‌آید و برچسب‌ها از `GET /api/v1/permissions`.
- `Permission` در `shared/domain` یک union type از همین ۱۹ کلید است؛ تست قرارداد آن را با enum تولیدشده مقایسه می‌کند.
- UI با `PermissionGuard` و `usePermission` پنهان یا غیرفعال می‌کند؛ تصمیم نهایی با سرور است.

---

## ۵. ماژول‌های فروشنده (نسخه ۱.۰)

| # | ماژول | مسئولیت | فرآیندها | ماژول بک‌اند | مجوزهای اصلی |
|---|---|---|---|---|---|
| 1 | `auth` (shared) | ورود با موبایل و OTP، نشست، خروج، تغییر موبایل | F01 | Identity | — |
| 2 | `store` | فروشگاه‌های من، ساخت، پروفایل، اطلاعات خصوصی، تنظیمات، شروع کار | F02، F03، F78 | Stores | `store.settings` |
| 3 | `staff-access` | کارکنان، دعوت، مجوزها، انتقال مالکیت، دستگاه‌های فعال | F56، F72 | Stores، Identity | `staff.manage` |
| 4 | `catalog` | کاتالوگ، دسته و نوع کالا، واحد، برند، ویژگی، درخواست اصلاح | F05–F07، F11 | Catalog | `product.manage` |
| 5 | `product-entry` | ویزارد ثبت **کالا یا خدمت**، اسکن، بارکد دستی، تطبیق، واحد، موجودی، قیمت، بازبینی؛ ثبت چندردیفی | F07–F10، F12–F14، F16، F73، **F84** | Purchasing (`product-entry`)، Inventory | `product.manage`، `purchase.manage` |
| 6 | `bulk-import` | ورود Excel | F31 | Imports | `purchase.manage` |
| 7 | `products` | کالاها و خدمت‌های فروشگاه، جزئیات، نام محلی، بایگانی، سابقه قیمت، بارکد داخلی | F11، F15، F16، F68 | Inventory | `product.manage`، `price.change` |
| 8 | `inventory` | موجودی (فقط کالا)، گردش، تعدیل، شمارش | F15، F61 | Inventory | `stock.view`، `stock.adjust` |
| 9 | `purchasing` | تأمین‌کننده، رسید خرید، اصلاح و ابطال | F13، F70، F71 | Purchasing | `purchase.manage`، `purchase.correct` |
| 10 | `sales` | سبد (کالا و خدمت؛ جست‌وجو با نام، **میان‌بر** یا بارکد)، تخفیف، مشتری، پرداخت، بازبینی و ثبت | F17–F19، F32، F38، **F84** | Sales | `sale.*` |
| 11 | `invoices` | فاکتور، پیامک، اشتراک و چاپ، فهرست، اصلاح | F20، F57، F60 | Sales | `sale.correct` |
| 12 | `customers` | مشتریان، پرونده، ادغام، بایگانی، صورت‌حساب | F18، F21، F76 | Customers، Sales | `customer.manage`، `customer.merge` |
| 13 | `receivables` | نسیه، بدهکاران، تسویه و تخصیص؛ **بررسی درخواست تسویه مشتری (۱.۲)** | F22، F23، F34 | Sales، CustomerPortal | `debt.settle` |
| 14 | `cheques` | چک دریافتی | F38 | Sales | `debt.settle` |
| 15 | `reports` | گزارش‌ها (خدمت از گزارش‌های موجودی حذف) | F24–F27، F58، F77 | Reporting | `report.financial` |
| 16 | `action-center` | اقدام‌های فروشگاه | F59 | Reporting | — |
| 17 | `data-export` | خروجی | F66 | Reporting | `data.export` |
| 18 | `support` | راهنما و پشتیبانی | F78 | Stores | — |
| — | `shared/scanner` | دوربین و بارکد | F08 | — | — |
| — | اپ (`widgets`) | خانه، منوی بیشتر، ناوبری، حالت‌های مشترک | F04، F28 | Reporting (summary، actions/counts) | — |

### اثر «خدمت» روی ماژول‌های فروشنده (BIZ-SRV)

| ماژول | تغییر |
|---|---|
| `product-entry` | گام اول «کالا یا خدمت»؛ برای خدمت فقط عنوان، واحد، قیمت، میان‌بر و بهای اختیاری؛ گام‌های اسکن، بسته، موجودی و تولید/انقضا حذف |
| `products` | فیلتر نوع؛ `ItemKindBadge`؛ برای خدمت بخش موجودی نمایش داده نمی‌شود |
| `sales` | جست‌وجو روی عنوان، SKU، میان‌بر و بارکد با اولویت تطبیق دقیق میان‌بر؛ ردیف خدمت بدون کنترل موجودی |
| `invoices` | ردیف خدمت مثل کالا با واحد خدمت |
| `inventory`، `reports` (کمبود، سلامت، ارزش موجودی)، شمارش | فقط کالا |

تا اعمال BCR-02 ثبت و فروش خدمت پشت `ReleaseGate` (`feature:service-items`) است.

### فیچرهای فرانت به تفکیک ماژول

فهرست کامل رفتار هر ماژول (ورود، فروشگاه، کاتالوگ، ثبت کالا، Excel، کالاها، موجودی، خرید، فروش، فاکتور، مشتری، نسیه، چک، گزارش، اقدام، خروجی، پشتیبانی) بدون تغییر نسبت به نسخه ۱.۰ است، با این اصلاح‌ها:

- **پول:** هیچ ماژولی تبدیل ریال/تومان انجام نمی‌دهد؛ `MoneyField` مقدار Decimal را همان‌طور که وارد شده به Mapper می‌دهد.
- **بارکد:** هیچ فرم ثبت یا فروشی بارکد را اجباری نمی‌کند (BIZ-SRV-03).
- **مجوزها:** کلیدها دقیقاً ۱۹ کلید بخش ۴ هستند؛ `sale.correct` و `purchase.correct` برای اصلاح فاکتور و خرید.
- **receivables:** صف «درخواست‌های تسویه مشتریان» (`…/settlement-requests`، ۱.۲) و «ادعای مال من نیست» (`…/customer-claims`) و تنظیم پنل مشتری (`…/portal-settings`) پشت ReleaseGate ۱.۲.

---

## ۶. ماژول‌های مشتری و لندینگ

### اپ مشتری (`apps/customer`) — نسخه ۱.۲، موبایل

| # | ماژول | مسئولیت | فرآیندها | API |
|---|---|---|---|---|
| 1 | `auth` (shared، Theme مشتری) | ورود با موبایل و OTP (بدون رمز؛ تصمیم 2.4.0)، خطاها، خروج | F33 | `/auth/*` |
| 2 | `buyer-account` | خانه «حساب من»، فروشگاه‌های من، گردش و بدهی هر فروشگاه، صورت‌حساب | F33، F79 | `/customer/stores`، `/customer/stores/{storeId}/account\|statement` |
| 3 | `buyer-invoices` | خریدهای من (همه فروشگاه‌ها، فیلتر همه/بدهکار/تسویه‌شده)، جزئیات فاکتور، دانلود، ورود از لینک پیامکی | F33، F85 | `/customer/invoices`، `/customer/invoices/{invoiceId}` |
| 4 | `buyer-settlements` | درخواست تسویه با فیش، پیگیری Timeline، تکمیل و لغو | F34 | `/customer/settlement-requests/*` |
| 5 | `buyer-claims` | اعلام مغایرت / «این فاکتور متعلق به من نیست» | F35، F79 | `/customer/claims` |
| 6 | `buyer-profile` | اطلاعات حساب، تغییر موبایل، دستگاه‌های من | F33، F69 | `/me`، `/me/sessions/*`، `/me/mobile-change*` |

قواعد کلیدی: هر دسترسی خارج از دامنه مشتری ۴۰۴ است (BIZ-BUY-05)؛ فیش تا تأیید فروشنده مانده را تغییر نمی‌دهد (BIZ-BUY-06)؛ «مال من نیست» سند فروشگاه را حذف نمی‌کند (BIZ-BUY-04)؛ فروشگاهی که پنل مشتری را خاموش کرده دیده نمی‌شود.

### نسخه ۳.۰ در اپ مشتری (پشت ReleaseGate، ساختار از حالا)

| ماژول | مسئولیت | API فعلی | BCR |
|---|---|---|---|
| `memberships` | عضویت در فروشگاه از QR، لینک پیامکی یا خرید حضوری | — (فعلاً `/customer/stores`) | BCR-04 |
| `storefront` | ویترین فروشگاه، دسته‌ها، جست‌وجو، کالا و خدمت | `/shop/by-code/{code}`، `/shop/{storeId}/*` | — |
| `buyer-cart` | سبد مشترک کالا و خدمت | `/shop/{storeId}/cart*` | — |
| `checkout` | شیوه دریافت (۲ شیوه)، بازه، نشانی، پرداخت، پیش‌سفارش، ثبت | `/shop/{storeId}/orders`، `/shop/{storeId}/slots`، `/customer/addresses` | BCR-05، BCR-06 |
| `buyer-orders` | سفارش‌های من، پیگیری، پذیرش اصلاح یا قیمت، فیش، لغو، سفارش مجدد | `/customer/orders/*` | BCR-07، BCR-09 |
| `print-order` | مشخصات پرینت، بارگذاری فایل، تنظیم پیش‌فرض و استثنای فایل، پیش‌نمایش مبلغ | — | BCR-08، BCR-10 |

### لندینگ (`apps/landing`)

| ماژول | مسئولیت | فرآیند |
|---|---|---|
| `marketing` | ناوبری، Hero، سه قابلیت، دو اپ (فروشنده/خریدار)، اعتماد، پانویس؛ CTAهای ورود فروشنده و مشتری | F64 |

قاعده F64: قابلیت آینده به‌عنوان فعال عرضه نمی‌شود؛ کارت «سفارش مشتری» تا انتشار ۳.۰ برچسب «به‌زودی» دارد. ورود فروشنده به اپ فروشنده و ورود مشتری به اپ مشتری می‌رود.

---

## ۷. ماژول‌های آینده

| صفحه فیگما | نسخه | اپ | ماژول‌ها |
|---|---|---|---|
| 16 — Seller Desktop | ۱.۰ | seller | `DesktopShell`؛ فقط لایه ui و Shell |
| 18 — ادمین | ۱.۰ | admin | `admin-moderation`، `admin-catalog`، `admin-schema`، `admin-seed`، `admin-platform` |
| 19 — ورود گروهی | ۱.۱ | seller | توسعه `bulk-import`، `reports`، `catalog` (ماتریس تنوع F74) |
| 20 — مشتری دسکتاپ | ۱.۲ | customer | فقط لایه ui |
| 21 و 22 — مالی | ۲.۰ | seller | `expenses`، `vouchers`، `cash-bank`، `cheques` (پرداختی)، `recurring-obligations`، `financial-opening` |
| 23 — حسابداری | ۲.۱ | seller | `accounting` |
| 24 و 25 — سفارش | ۳.۰ | seller + customer | فروشنده: `orders` (صف، بازبینی، اصلاح، **قیمت‌گذاری خدمت**، رزرو، فیش، آماده‌سازی، تحویل، لغو)، `storefront-settings` (کانال، QR، بازه‌ها، **امکانات و تعرفه چاپ**)؛ مشتری: بخش ۶ |
| 26 — وفاداری | ۳.۱ | seller + customer | `loyalty`، `credit-trust`، رضایت تبلیغاتی (BCR-12) |
| 27 — دستیار | ۴.۰ | seller | `assistant` |

آمادگی امروز: `ReleaseGate` با `ProductRelease` بک‌اند؛ `AppEvent`های آینده رزرو؛ `cheques` نوع `Received`/`Issued` دارد؛ `available = onHand − reserved` در `shared/domain`؛ `ItemKind` از روز اول در مدل‌های کالا، سبد و فاکتور.

---

## ۸. مسیرها

### اپ فروشنده (`~` = `/s/[storeId]`)

درخت `apps/seller/src/app`:

```text
app/
├─ layout.tsx               <html lang="fa" dir="rtl" data-theme="shop">، IRANSansX، Providers
├─ (auth)/login، login/otp  AuthShell
├─ (account)/stores، stores/new
└─ s/[storeId]/
   ├─ layout.tsx            StoreGate: GET /api/v1/stores/{storeId} ← نقش و مجوزها، ReleaseGate، DraftStore
   ├─ (tabs)/               TabsShell: home، products، customers، reports، more
   ├─ (lists)/              inventory، catalog، categories، invoices، debts، cheques، purchases، actions، settings/*
   ├─ (flow)/               entry/*، import/*، sales/new/*، purchases/new/*، customers/[id]/settle/*، فرم‌ها
   └─ (scan)/               entry/scan، sales/new/scan
```

| ماژول | مسیرها |
|---|---|
| auth | `/login`، `/login/otp` |
| store | `/stores`، `/stores/new`، `~/onboarding`، `~/settings`، `~/settings/store`، `~/settings/store/edit`، `~/settings/store/legal` |
| staff-access | `~/settings/staff`، `~/settings/staff/invite`، `~/settings/staff/[memberId]`، `~/settings/sessions` |
| اپ | `~/home`، `~/more` |
| catalog | `~/catalog`، `~/catalog/[catalogId]`، `~/catalog/[catalogId]/correction`، `~/categories`، `~/categories/new`، `~/categories/[typeId]` |
| product-entry | `~/entry`، `~/entry/service` (**خدمت**)، `~/entry/search`، `~/entry/scan`، `~/entry/scan/result`، `~/entry/barcode`، `~/entry/[draftId]/…` (catalog-item، manual، attributes، images، units، stock، stock/details، pricing، review، done)؛ `~/entry/bulk`، `/bulk/review`، `/bulk/done` |
| bulk-import | `~/import`، `~/import/template`، `~/import/history`، `~/import/[runId]/mapping\|preview\|rows/[row]\|result\|errors` |
| products | `~/products`، `~/products/[productId]`، `~/products/[productId]/local` |
| inventory | `~/inventory`، `~/inventory/count`، `~/inventory/[productId]/movements`، `~/inventory/[productId]/adjust` |
| purchasing | `~/purchases`، `~/purchases/new`، `/new/totals`، `/new/attachment`، `~/purchases/[purchaseId]`، `/correction` |
| sales | `~/sales/new`، `/scan`، `/barcode`، `/lines/[lineId]`، `/quick-product`، `/discount`، `/customer`، `/customer/new`، `/payment`، `/payment/cash\|transfer\|split\|credit\|cheque`، `/review` |
| invoices | `~/invoices`، `~/invoices/[invoiceId]`، `/customer`، `/sms`، `/share`، `/correction` |
| customers | `~/customers`، `~/customers/new`، `~/customers/[customerId]`، `/edit`، `/merge`، `/archive`، `/statement` |
| receivables | `~/debts`، `~/debts/debtors`، `~/customers/[customerId]/debt-history\|standing\|settle\|settle/allocation`؛ `~/debts/settlement-requests` (۱.۲)؛ `/reminder` (۱.۱) |
| cheques | `~/cheques`، `~/cheques/[chequeId]`، `/collect`، `/bounce`، `/return`؛ `~/customers/[customerId]/settle/cheque` |
| reports | `~/reports`، `/sales`، `/daily`، `/low-stock`، `/low-stock/[productId]`، `/data-issues`، `/data-issues/[productId]/cost`، `/profit`، `/performance`، `/analysis`، `/purchase-vs-sales`، `/discounts`، `/stock-health` |
| action-center، data-export، support | `~/actions`، `~/settings/export`، `~/settings/support` |
| orders (۳.۰، خاموش) | `~/orders`، `~/orders/[orderId]`، `~/orders/[orderId]/slip`، `~/orders/[orderId]/quote`، `~/settings/storefront`، `~/settings/storefront/print` |

### اپ مشتری

```text
app/
├─ layout.tsx               <html lang="fa" dir="rtl" data-theme="customer">
├─ (auth)/login، login/otp  AuthShell
├─ i/[token]/               لینک پیامکی فاکتور ← OTP ← فاکتور (F85)
├─ (tabs)/                  TabsShell: خانه، خریدها، سفارش‌ها (۳.۰)، حساب من
│  ├─ page.tsx              خانه (customerhome)
│  ├─ purchases/            خریدهای من
│  ├─ debts/                بدهی‌های من به تفکیک فروشگاه (تب والد: حساب من)
│  ├─ orders/               (۳.۰)
│  └─ account/              منوی حساب (buyernavigation)
├─ (flow)/                  FlowShell
│  ├─ purchases/[invoiceId]/
│  ├─ stores/[storeId]/     گردش حساب و بدهی (debt)
│  ├─ stores/[storeId]/settle/          درخواست تسویه (settlementrequest)
│  ├─ settlements/[requestId]/          پیگیری (requesttimeline)
│  ├─ claims/new/ و claims/done/        اعلام مغایرت و نتیجه (dispute، claim، disputedone)
│  ├─ account/profile/                  اطلاعات حساب
│  └─ account/sessions/                 دستگاه‌های من
└─ (3.0)/ s/[code]، shop/[storeId]، shop/[storeId]/cart، shop/[storeId]/checkout، shop/[storeId]/print، orders/[orderId]
```

| ماژول | مسیرها |
|---|---|
| auth | `/login`، `/login/otp` |
| buyer-account | `/`، `/account`، `/debts`، `/stores/[storeId]` |
| buyer-invoices | `/purchases`، `/purchases/[invoiceId]`، `/i/[token]` |
| buyer-settlements | `/stores/[storeId]/settle`، `/settlements/[requestId]` |
| buyer-claims | `/claims/new`، `/claims/done` |
| buyer-profile | `/account/profile`، `/account/sessions` |
| ۳.۰ | `/s/[code]`، `/shop/[storeId]`، `/shop/[storeId]/cart`، `/shop/[storeId]/checkout`، `/shop/[storeId]/print`، `/orders`، `/orders/[orderId]` |

### لندینگ

| مسیر | محتوا |
|---|---|
| `/` | LAND-D01: ناوبری با لنگرهای «امکانات، برای فروشنده، برای خریدار، درباره دکانی»، Hero، قابلیت‌ها، دو اپ، اعتماد، پانویس |

### قراردادهای مسیر

- حالت‌های یک صفحه (مثل invoicecash یا otp-expired) مسیر جدا ندارند؛ از داده سرور یا وضعیت use-case می‌آیند. شیت‌ها روی موبایل BottomSheet و با Intercepting Route قابل لینک‌اند.
- فیلتر و بازه گزارش در query string نگه داشته می‌شود.
- `draftId` از `DraftStore` می‌آید؛ رفرش ویزارد پیش‌نویس را از IndexedDB بازیابی می‌کند.
- ترک فرم تغییرکرده با گفت‌وگوی «ذخیره پیش‌نویس / دورریختن / انصراف» (`useLeaveGuard`).
- بعد از ثبت موفق، `router.replace` به صفحه نتیجه.

---

## ۹. دغدغه‌های مشترک

### پول، مقدار و ورودی عددی

```ts
// packages/shared/domain/src/money.ts
export type Money = { readonly amount: DecimalString; readonly __brand: 'Money' };
export const money = (v: string | number | bigint): Money => ({ amount: toDecimalString(v) } as Money);
export const addMoney = (a: Money, b: Money): Money => money(decimal(a.amount).plus(b.amount).toString());
// نمایش: formatMoney(m) → «۴۱۰٬۰۰۰ تومان» — برچسب واحد از تنظیم سراسری، بدون هیچ تبدیل

// packages/features/sales/src/infrastructure/sale.mapper.ts
// BCR-01: تا Decimal شدن API، مقدار int64 «…Rials» بی‌تغییر خوانده می‌شود.
const fromApiMoney = (v: number): Money => money(v);
```

| نوع | قرارداد |
|---|---|
| Money | رشته Decimal canonical؛ محاسبه پیش‌نمایش با `Decimal` (Adapter روی big.js)؛ جمع قطعی از سرور؛ float ممنوع |
| Quantity | Decimal؛ حداکثر اعشار از `BaseUnitMaxDecimals`؛ کالای شمارشی کسری ندارد |
| موبایل و OTP | رشته؛ `type="tel"`/`inputMode="numeric"`؛ OTP `autoComplete="one-time-code"` |
| بارکد و میان‌بر | رشته با حفظ صفر اول |
| نمایش | ارقام فارسی در UI، ASCII در payload؛ موبایل، بارکد و شماره داخل `<bdi dir="ltr">` |
| سه حالت | صفر، نامعلوم و خطا نمایش جدا دارند (D17) |

قواعد ورودی موبایل و OTP دقیقاً طبق ui-guidelines بازنگری 2.4.1 (نرمال‌سازی ارقام، Paste با `+98`/`0098`، رد حروف بدون حذف، خطا از اولین تغییر، پیام‌های ثابت).

### ثبت قطعی، Idempotency و نتیجه نامعلوم (F28، P11)

```ts
// packages/shared/domain/src/submit-state.ts
export type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting'; operationId: OperationId }
  | { kind: 'succeeded'; resultId: string }
  | { kind: 'failed'; error: AppError }
  | { kind: 'unknown'; operationId: OperationId }
  | { kind: 'querying'; operationId: OperationId };

// apps/seller/src/composition/container.ts
const http = compose(
  createFetchAdapter(env.API_URL),
  (c) => withAuth(c, session),          // Bearer + refresh یک‌باره روی 401
  withIdempotency,                       // req.operationId → Idempotency-Key
  (c) => withRetry(c, { onlyIdempotent: true }),
  withErrorMapping,                      // ProblemDetails → AppError
  (c) => withLogging(c, logger),
);
const storeApi = (storeId: StoreId) => scoped(http, `/api/v1/stores/${storeId}`);
```

- دکمه تأیید در `submitting` و `querying` غیرفعال است و عرضش ثابت می‌ماند.
- `unknown` ← `GET /api/v1/stores/{storeId}/operations/{operationId}`: `Completed` ← نتیجه ذخیره‌شده؛ `Failed` ← `errorCode`؛ `Pending` ← استعلام دوباره با فاصله؛ هرگز درخواست با کلید تازه نمی‌سازد.

### نشست و احراز هویت

- `POST /auth/otp/request` ← `OtpRequestedDto` (شمارنده ارسال دوباره از `resendAvailableAt` سرور)؛ `POST /auth/otp/verify` ← `AuthTokensDto`.
- Route Handler در هر اپ (`/bff/auth/verify|refresh|logout`) Refresh Token را در کوکی `httpOnly; Secure; SameSite=Strict` نگه می‌دارد؛ Access Token فقط در حافظه. Refresh چرخشی؛ ۴۰۱ ← یک Refresh هم‌زمان (single-flight).
- `SESSION_REVOKED` ← خروج و پاک‌کردن پیش‌نویس‌های حساس از حافظه.

### پیش‌نویس و آفلاین (BIZ-IMP-07، BIZ-SALE-09)

| موضوع | قرارداد |
|---|---|
| ذخیره | `DraftStore` روی IndexedDB؛ کلید `storeId + userId + flow + draftId` |
| موارد | سبد فروش، ویزارد ثبت کالا و خدمت، ثبت چندردیفی، رسید خرید، تسویه، نگاشت Import، درخواست تسویه مشتری |
| Resume | قیمت، بها، فعال‌بودن، موجودی و مجوز دوباره خوانده و تفاوت نشان داده می‌شود |
| آفلاین | ویرایش پیش‌نویس مجاز، ثبت قطعی ممنوع |
| PWA | Service Worker فقط Shell و دارایی ایستا را کش می‌کند |

### فروشگاه فعال و مجوز

- `StoreGate` در layout `s/[storeId]` داده `GET /api/v1/stores/{storeId}` را می‌گیرد (`myRole`، `myPermissions`، `completion`) و در Container می‌گذارد.
- تغییر فروشگاه با پیش‌نویس باز: ذخیره/دورریختن/انصراف؛ سبد هرگز به فروشگاه دیگر نمی‌رود.

### تاریخ و زمان

`DateService` با date-fns-jalali و منطقه زمانی فروشگاه (`StoreDto.timeZoneId`، پیش‌فرض Asia/Tehran)؛ هفته شنبه تا جمعه؛ بازه نیمه‌باز؛ Date-only یا UTC instant در payload.

### خطا و حالت صفحه

هر صفحه داده از `PageState` مشترک استفاده می‌کند: Loading (اسکلت همان ناحیه)، Empty (توضیح و اقدام)، Error، Offline، Permission، Partial، Stale، NotReleased. نگاشت کدها در بخش ۴.

### اسکنر

Facade `BarcodeScanner` با Adapter `BarcodeDetector` و جایگزین zxing-wasm؛ ضدتکرار تا خروج از کادر؛ بازخورد بصری الزامی؛ ورود دستی همیشه در دسترس؛ اسکنر فقط یکی از راه‌های پیداکردن قلم است (BIZ-SRV-03).

### سنجش، i18n و دسترس‌پذیری

- `Analytics` فقط رویدادهای بی‌نام (`screen_view`، `draft_saved`، `validation_failed`، `submit_started`، `submit_result`، `recovery_used`).
- next-intl؛ همه متن‌ها کلید دارند؛ برچسب enumها در `ui/presentation` هر Feature.
- CSS logical properties اجباری؛ هدف لمسی ۴۴px؛ focus قابل رؤیت؛ `prefers-reduced-motion`؛ StickyActionBar بالای کیبورد و safe-area.

### کتابخانه‌ها پشت Facade

| Facade | پکیج | Adapter |
|---|---|---|
| `HttpClient` | shared/http | fetch |
| `useAppQuery` / `useAppMutation` | shared/data | TanStack Query |
| `useAppForm` | ui-kit | React Hook Form + zod |
| `Decimal` | shared/domain | big.js |
| `DraftStore`، `Storage` | shared/platform | idb، localStorage |
| `DateService`، `DateField` | platform، ui-kit | date-fns-jalali |
| `BarcodeScanner` | shared/scanner | BarcodeDetector، zxing-wasm |
| `Chart` | ui-kit | Recharts |
| `Dialog`، `BottomSheet` | ui-kit | Radix UI، vaul |
| `I18n` | platform | next-intl |

---

## ۱۰. فازبندی و موارد باز

هر فاز روی branch کامیت و push می‌شود و پیش از فاز بعد بازبینی می‌شود.

| فاز | خروجی | معیار پایان |
|---|---|---|
| ۰ — زیرساخت | Nx workspace، config و قواعد مرز، `design-tokens` از فیگما، `contracts` از OpenAPI، shared domain/http/data/platform، CI | lint مرزها سبز؛ تست واحد digits/mobile/money/decimal |
| ۱ — ui-kit و Storybook | همه کامپوننت‌های 02 و 03 + Shellها، شبیه فیگما | **بازبینی و تأیید مالک** |
| ۲ — ورود، فروشگاه، Shell فروشنده + لندینگ | auth، store، staff-access (پایه)، خانه، منوی بیشتر؛ `apps/landing` | معیارهای ui-guidelines 2.4.1 در E2E |
| ۳ — کالا و خدمت | product-entry (کالا و خدمت)، scanner، catalog، products، inventory (فهرست و گردش) | ۳ بسته ۲۰تایی = ۶۰ عدد؛ ثبت خدمت بدون بارکد |
| ۴ — فروش | sales، invoices، customers | دو لمس یک فاکتور؛ فاکتور کالا + خدمت |
| ۵ — نسیه و چک | receivables، cheques | دریافت ۱۵۰ روی ۱۰۰/۱۰۰ ← ۱۰۰/۵۰ |
| ۶ — خرید و موجودی | purchasing، inventory، bulk | F13، F14، F31، F61، F70، F71 |
| ۷ — گزارش و عملیات | reports، action-center، data-export، staff کامل، support، اصلاح فاکتور | سود ۱۰۰۰/۷۰۰/۴۰۰ ← ۳۰۰ با پوشش ۷۰٪ |
| ۸ — مشتری ۱.۲ (موبایل) | buyer-*، auth با Theme مشتری؛ سمت فروشنده بررسی درخواست تسویه | F33–F35، F79 |
| بعد | دسکتاپ (16، 20)، ادمین (18)، ۳.۰ (سفارش، عضویت، پرینت) پس از BCRها | — |

### موارد باز

1. لینک صفحه‌های 02 و 03 فیگما (ID صفحه) برای خواندن کامل کامپوننت‌ها؛ nodeهای شناخته‌شده صفحه 03: `403:2`، `404:2`، `115:10`.
2. فایل و مجوز فونت IRANSansX (D4) پیش از فاز ۱ — در انتظار ارسال مالک.
3. ناوبری پایین اپ مشتری: صفحه 11 ناوبری چهارتایی دارد و صفحه 20b «اقدام ثابت» و منوی حساب؛ این سند ناوبری صفحه 11 را با تب «سفارش‌ها» پنهان تا ۳.۰ فرض کرده است.
4. صفحه 11 «ورود با رمز» (AUTH-C01) و «رتبه اعتباری» (CRD-C01) دارد؛ اولی با تصمیم 2.4.0 لغو است و دومی دامنه ۳.۱/آینده دارد — پیاده‌سازی نمی‌شوند.
5. لندینگ فقط فریم دسکتاپ دارد؛ نسخه موبایل از همان بخش‌ها چیده می‌شود. فرم دعوت پایلوت F64 فریم ندارد.
6. BCR-01 تا BCR-12 باید در بک‌اند تصمیم و زمان‌بندی شوند.
7. طرح فیگمای صفحات خدمت (ثبت خدمت، ردیف خدمت در سبد و فاکتور، سفارش پرینت، قیمت‌گذاری فروشنده، امکانات چاپ) هنوز وجود ندارد.

---

## پیوست الف — نگاشت فریم‌های صفحه 17 (Seller-V2)

هر ۲۱۲ فریم صفحه «17 — Seller -V2» یک ردیف دارد؛ «حالت» یعنی همان مسیر با داده یا وضعیت متفاوت، «شیت» یعنی BottomSheet روی همان مسیر. `~` = `/s/[storeId]`.

| فریم | عنوان | Node | ماژول | مسیر | فرآیند | نوع | نسخه |
|---|---|---|---|---|---|---|---|
| AUTH-01 | ورود با شماره موبایل | [358:478](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-478) | auth | `/login` | F01 | صفحه | ۱.۰ |
| AUTH-01-ERROR | شماره موبایل نامعتبر | [405:6105](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-6105) | auth | `/login` | F01 | حالت | ۱.۰ |
| AUTH-02 | کد ورود پیامکی | [358:479](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-479) | auth | `/login/otp` | F01 | صفحه | ۱.۰ |
| otp-wrong | کد ورود درست نیست | [394:6038](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=394-6038) | auth | `/login/otp` | F01 | حالت | ۱.۰ |
| otp-expired | مهلت کد تمام شد | [394:6059](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=394-6059) | auth | `/login/otp` | F01 | حالت | ۱.۰ |
| otp-limited | کمی صبر کنید | [394:6076](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=394-6076) | auth | `/login/otp` | F01 | حالت | ۱.۰ |
| otp-send-failed | کد ارسال نشد | [394:6091](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=394-6091) | auth | `/login/otp` | F01 | حالت | ۱.۰ |
| AUTH-02-ERROR | کد ناقص یا غیرعددی | [405:6128](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-6128) | auth | `/login/otp` | F01 | حالت | ۱.۰ |
| storeselect | فروشگاه‌های من | [358:480](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-480) | store | `/stores` | F02 | صفحه | ۱.۰ |
| setup | راه‌اندازی فروشگاه | [312:8744](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8744) | store | `/stores/new` | F02 | صفحه | ۱.۰ |
| ST02 | انتخاب نوع فروشگاه | [385:6827](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-6827) | store | /stores/new (گام نوع فروشگاه) | F02 | شیت | ۱.۰ |
| onboarding | شروع کار فروشگاه | [358:560](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-560) | store | `~/onboarding` | F78 | صفحه | ۱.۰ |
| settings | تنظیمات فروشگاه | [358:484](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-484) | store | `~/settings` | F03/F56 | صفحه | ۱.۰ |
| STORE-04 · SHOP-S02 | اطلاعات فروشگاه | [385:6853](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-6853) | store | `~/settings/store` | F03 | صفحه | ۱.۰ |
| storeprofile | اطلاعات فروشگاه | [358:481](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-481) | store | `~/settings/store/edit` | F03 | صفحه | ۱.۰ |
| STORE-05 · SHOP-S03 | ویرایش فروشگاه | [385:6912](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-6912) | store | `~/settings/store/edit` | F03 | صفحه | ۱.۰ |
| storelegal | اطلاعات تکمیلی | [358:482](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-482) | store | `~/settings/store/legal` | F03 | صفحه | ۱.۰ |
| sessions | دستگاه‌های فعال | [358:555](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-555) | staff-access | `~/settings/sessions` | F56 | صفحه | ۱.۰ |
| sessiondone | نشست‌ها بسته شدند | [358:556](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-556) | staff-access | `~/settings/sessions` | F56 | حالت | ۱.۰ |
| staff | کارکنان و دسترسی‌ها | [358:552](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-552) | staff-access | `~/settings/staff` | F56/F72 | صفحه | ۱.۰ |
| permissions | دسترسی همکار | [358:554](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-554) | staff-access | `~/settings/staff/[memberId]` | F56 | صفحه | ۱.۰ |
| invite | دعوت همکار | [358:553](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-553) | staff-access | `~/settings/staff/invite` | F72 | صفحه | ۱.۰ |
| menu | بیشتر | [358:483](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-483) | app-shell | `~/more` | F04 | صفحه | ۱.۰ |
| home | امروز در فروشگاه | [312:8673](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8673) | app-shell (dashboard) | `~/home` | F04 | صفحه | ۱.۰ |
| loading | در حال ثبت | [316:2280](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=316-2280) | ui-kit | حالت مشترک Committing (~/sales/new/review) | F28 | حالت | ۱.۰ |
| empty | هنوز کالایی ندارید | [312:10728](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10728) | ui-kit | حالت مشترک Empty (~/products) | F04 | حالت | ۱.۰ |
| network | اتصال قطع شد | [312:10708](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10708) | ui-kit | حالت مشترک Offline | F28 | حالت | ۱.۰ |
| ثبت کالای جدید — حالت اسکرول‌شده | ثبت کالای جدید — حالت اسکرول‌شده | [331:5255](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=331-5255) | ui-kit | مرجع اسکرول فرم و نوار اقدام ثابت | — | حالت | ۱.۰ |
| cataloglist | فهرست کاتالوگ | [358:485](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-485) | catalog | `~/catalog` | F07 | صفحه | ۱.۰ |
| CAT-S03 | جزئیات کاتالوگ | [385:7104](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7104) | catalog | `~/catalog/[catalogId]` | F07/F12 | صفحه | ۱.۰ |
| correction | درخواست اصلاح کاتالوگ | [312:9108](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9108) | catalog | `~/catalog/[catalogId]/correction` | F11 | صفحه | ۱.۰ |
| categories | دسته‌بندی‌ها و نوع کالا | [358:486](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-486) | catalog | `~/categories` | F05 | صفحه | ۱.۰ |
| category | نوع کالا: خودکار | [358:487](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-487) | catalog | `~/categories/[typeId]` | F05 | صفحه | ۱.۰ |
| categorynew | پیشنهاد نوع کالا | [358:488](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-488) | catalog | `~/categories/new` | F05 | صفحه | ۱.۰ |
| categoryweight | ثبت دسته‌بندی | [385:8526](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8526) | catalog | `~/categories/new` | F05/F12 | حالت | ۱.۰ |
| unitpicker | واحد پایه دسته‌بندی | [385:8477](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8477) | catalog | ~/categories/new (شیت واحد پایه) | F05/F12 | شیت | ۱.۰ |
| method | افزودن کالا | [312:8778](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8778) | product-entry | `~/entry` | F14 | صفحه | ۱.۰ |
| attributes | مشخصات اختیاری | [312:8922](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8922) | product-entry | `~/entry/[draftId]/attributes` | F06 | صفحه | ۱.۰ |
| attrs | مشخصات خودکار | [358:491](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-491) | product-entry | `~/entry/[draftId]/attributes` | F06 | صفحه | ۱.۰ |
| catalog | انتخاب کالای کاتالوگ | [312:8837](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8837) | product-entry | `~/entry/[draftId]/catalog-item` | F07/F10 | صفحه | ۱.۰ |
| success | کالا ثبت شد | [312:9475](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9475) | product-entry | `~/entry/[draftId]/done` | F13 | صفحه | ۱.۰ |
| images | تصاویر کالا | [358:492](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-492) | product-entry | `~/entry/[draftId]/images` | F73 | صفحه | ۱.۰ |
| imageedit | تنظیم تصویر | [358:493](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-493) | product-entry | `~/entry/[draftId]/images/[imageId]` | F73 | صفحه | ۱.۰ |
| manual | ثبت کالای جدید | [312:8870](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8870) | product-entry | `~/entry/[draftId]/manual` | F10 | صفحه | ۱.۰ |
| duplicate | این عنوان قبلاً ثبت شده | [312:8957](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8957) | product-entry | `~/entry/[draftId]/manual` | F10 | شیت | ۱.۰ |
| catalogweight | ثبت کاتالوگ وزنی | [385:8575](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8575) | product-entry | `~/entry/[draftId]/manual` | F10/F12 | حالت | ۱.۰ |
| pricing | قیمت فروش | [312:9409](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9409) | product-entry | `~/entry/[draftId]/pricing` | F16 | صفحه | ۱.۰ |
| pricingknown | قیمت فروش | [312:10785](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10785) | product-entry | `~/entry/[draftId]/pricing` | F16 | حالت | ۱.۰ |
| pricingestimated | قیمت فروش | [312:10851](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10851) | product-entry | `~/entry/[draftId]/pricing` | F16/F27 | حالت | ۱.۰ |
| review | بازبینی کالا و موجودی | [312:9441](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9441) | product-entry | `~/entry/[draftId]/review` | F13 | صفحه | ۱.۰ |
| reviewknown | بازبینی کالا و موجودی | [312:10817](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10817) | product-entry | `~/entry/[draftId]/review` | F13 | حالت | ۱.۰ |
| reviewestimated | بازبینی کالا و موجودی | [312:10883](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10883) | product-entry | `~/entry/[draftId]/review` | F13/F27 | حالت | ۱.۰ |
| weightreview | بازبینی موجودی وزنی | [385:8678](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8678) | product-entry | `~/entry/[draftId]/review` | F12/F13 | حالت | ۱.۰ |
| stock | افزودن موجودی | [312:9170](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9170) | product-entry | `~/entry/[draftId]/stock` | F13 | صفحه | ۱.۰ |
| opening | موجودی ابتدای کار | [312:9236](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9236) | product-entry | `~/entry/[draftId]/stock` | F13 | حالت | ۱.۰ |
| known | بهای موجودی اولیه | [312:9267](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9267) | product-entry | `~/entry/[draftId]/stock` | F13 | حالت | ۱.۰ |
| purchaseunit | انتخاب واحد خرید | [385:8376](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8376) | product-entry | `~/entry/[draftId]/stock` | F12/F13 | شیت | ۱.۰ |
| purchaseeach | خرید عددی | [385:8419](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8419) | product-entry | `~/entry/[draftId]/stock` | F12/F13 | حالت | ۱.۰ |
| stockweight | ثبت موجودی وزنی | [385:8628](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8628) | product-entry | `~/entry/[draftId]/stock` | F12/F13 | حالت | ۱.۰ |
| openingpack | موجودی اولیه بسته‌ای | [390:5870](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=390-5870) | product-entry | `~/entry/[draftId]/stock` | F12/F13 | حالت | ۱.۰ |
| stockdetails | اطلاعات تکمیلی موجودی | [358:494](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-494) | product-entry | `~/entry/[draftId]/stock/details` | F13 | صفحه | ۱.۰ |
| units | واحد و بسته | [312:9135](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9135) | product-entry | `~/entry/[draftId]/units` | F12 | صفحه | ۱.۰ |
| barcode | ورود دستی بارکد | [358:490](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-490) | product-entry | `~/entry/barcode` | F08 | صفحه | ۱.۰ |
| bulk | ثبت چند کالا | [358:499](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-499) | product-entry | `~/entry/bulk` | F14 | صفحه | ۱.۰ |
| bulkdone | ۲ کالا ثبت شد | [358:501](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-501) | product-entry | `~/entry/bulk/done` | F14 | صفحه | ۱.۰ |
| bulkreview | بررسی ثبت گروهی | [358:500](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-500) | product-entry | `~/entry/bulk/review` | F14 | صفحه | ۱.۰ |
| scanmatch | بارکد بسته شناسایی شد | [312:9044](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9044) | product-entry | `~/entry/scan/result` | F09 | صفحه | ۱.۰ |
| conflict | مشخصات بارکد مغایرت دارد | [312:9075](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9075) | product-entry | `~/entry/scan/result` | F09 | حالت | ۱.۰ |
| search | نتیجهٔ جست‌وجو | [312:8803](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8803) | product-entry | `~/entry/search` | F07 | صفحه | ۱.۰ |
| scan | اسکن بارکد | [312:8988](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8988) | product-entry + scanner | `~/entry/scan` | F08 | صفحه | ۱.۰ |
| scanundo | آخرین اسکن بازگردانده شد | [358:489](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-489) | product-entry + scanner | `~/entry/scan` | F08 | حالت | ۱.۰ |
| B00 | مجوز دوربین | [312:9020](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9020) | product-entry + scanner | ~/entry/scan (مجوز دوربین) | F08 | حالت | ۱.۰ |
| scansettings | تنظیمات اسکن | [358:557](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-557) | scanner | `~/settings/scan` | F08 | صفحه | ۱.۰ |
| import | ورود از Excel | [358:502](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-502) | bulk-import | `~/import` | F31 | صفحه | ۱.۰ |
| importerrors | ردیف‌های نیازمند اصلاح | [358:508](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-508) | bulk-import | `~/import/[runId]/errors` | F31 | صفحه | ۱.۰ |
| importmap | تطبیق ستون‌های فایل | [358:504](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-504) | bulk-import | `~/import/[runId]/mapping` | F31 | صفحه | ۱.۰ |
| importpreview | بررسی فایل | [358:505](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-505) | bulk-import | `~/import/[runId]/preview` | F31 | صفحه | ۱.۰ |
| importdone | نتیجه ورود فایل | [358:507](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-507) | bulk-import | `~/import/[runId]/result` | F31 | صفحه | ۱.۰ |
| importresolve | اصلاح ردیف ۱۴ | [358:506](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-506) | bulk-import | `~/import/[runId]/rows/[row]` | F31 | صفحه | ۱.۰ |
| importhistory | تاریخچه ورود فایل | [358:509](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-509) | bulk-import | `~/import/history` | F31 | صفحه | ۱.۰ |
| importtemplate | فایل نمونه آماده است | [358:503](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-503) | bulk-import | `~/import/template` | F31 | صفحه | ۱.۰ |
| products | کالا و موجودی | [312:9504](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9504) | products | `~/products` | F15 | صفحه | ۱.۰ |
| detail | خودکار بیک آبی مدل A | [312:9534](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9534) | products | `~/products/[productId]` | F11/F16 | صفحه | ۱.۰ |
| newdetail | کالای ثبت‌شده در فروشگاه | [312:10745](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10745) | products | `~/products/[productId]` | F10 | حالت | ۱.۰ |
| local | نام و یادداشت فروشگاه | [312:9574](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9574) | products | `~/products/[productId]/local` | F11 | صفحه | ۱.۰ |
| inventory | فهرست موجودی‌ها | [358:495](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-495) | inventory | `~/inventory` | F15 | صفحه | ۱.۰ |
| adjust | اصلاح تعداد موجودی | [358:497](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-497) | inventory | `~/inventory/[productId]/adjust` | F15 | صفحه | ۱.۰ |
| movements | گردش موجودی | [358:496](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-496) | inventory | `~/inventory/[productId]/movements` | F15 | صفحه | ۱.۰ |
| count | شمارش موجودی | [358:498](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-498) | inventory | `~/inventory/count` | F61 | صفحه | ۱.۰ |
| purchaselist | خریدها | [358:546](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-546) | purchasing | `~/purchases` | F71 | صفحه | ۱.۰ |
| purchasedetail | رسید خرید شماره ۱۲ | [358:549](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-549) | purchasing | `~/purchases/[purchaseId]` | F71 | صفحه | ۱.۰ |
| purchasecorrection | اصلاح رسید خرید | [358:550](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-550) | purchasing | `~/purchases/[purchaseId]/correction` | F70 | صفحه | ۱.۰ |
| purchase | ثبت خرید جدید | [312:9194](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9194) | purchasing | `~/purchases/new` | F13/F71 | صفحه | ۱.۰ |
| purchaseattachment | ضمیمه فاکتور خرید | [358:548](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-548) | purchasing | `~/purchases/new/attachment` | F71 | صفحه | ۱.۰ |
| purchasetotals | جمع رسید خرید | [358:547](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-547) | purchasing | `~/purchases/new/totals` | F71 | صفحه | ۱.۰ |
| sale | فروش جدید | [312:9604](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9604) | sales | `~/sales/new` | F17 | صفحه | ۱.۰ |
| salebarcode | بارکد کالای فروش | [358:511](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-511) | sales | `~/sales/new/barcode` | F17 | شیت | ۱.۰ |
| customersearch | مشتری این خرید | [358:515](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-515) | sales | `~/sales/new/customer` | F18 | صفحه | ۱.۰ |
| newcustomer | ثبت مشتری | [312:10060](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10060) | sales | `~/sales/new/customer/new` | F18 | صفحه | ۱.۰ |
| discount | تخفیف فروش | [358:514](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-514) | sales | `~/sales/new/discount` | F17 | شیت | ۱.۰ |
| saleitem | ویرایش ردیف فروش | [358:512](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-512) | sales | `~/sales/new/lines/[lineId]` | F17/F12 | شیت | ۱.۰ |
| salequick | ثبت سریع حین فروش | [358:513](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-513) | sales | `~/sales/new/quick-product` | F17 | صفحه | ۱.۰ |
| salescan | اسکن برای فروش | [358:510](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-510) | sales + scanner | `~/sales/new/scan` | F17 | صفحه | ۱.۰ |
| payment | دریافت وجه | [312:9647](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9647) | sales (checkout) | `~/sales/new/payment` | F19 | صفحه | ۱.۰ |
| paymentguest | پرداخت بدون مشتری | [358:516](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-516) | sales (checkout) | `~/sales/new/payment` | F19 | حالت | ۱.۰ |
| cash | دریافت نقدی کامل | [312:9685](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9685) | sales (checkout) | `~/sales/new/payment/cash` | F19 | صفحه | ۱.۰ |
| over | بقیهٔ پول مشتری | [312:9774](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9774) | sales (checkout) | `~/sales/new/payment/cash` | F19 | حالت | ۱.۰ |
| change | تأیید فروش و بقیهٔ فوری | [312:9801](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9801) | sales (checkout) | `~/sales/new/payment/cash` | F19 | حالت | ۱.۰ |
| partial | دریافت بخشی از مبلغ | [312:9711](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9711) | sales (checkout) | `~/sales/new/payment/credit` | F19 | صفحه | ۱.۰ |
| credit | فروش تماماً نسیه | [312:9749](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9749) | sales (checkout) | `~/sales/new/payment/credit` | F19 | حالت | ۱.۰ |
| split | پرداخت با چند روش | [358:518](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-518) | sales (checkout) | `~/sales/new/payment/split` | F32 | صفحه | ۱.۰ |
| checksplit | چک در پرداخت چندروش | [390:5907](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=390-5907) | sales (checkout) | `~/sales/new/payment/split` | F32/F38 | حالت | ۱.۰ |
| transfer | کارت‌به‌کارت | [358:517](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-517) | sales (checkout) | `~/sales/new/payment/transfer` | F19 | صفحه | ۱.۰ |
| salereview | تأیید فروش | [358:519](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-519) | sales (checkout) | `~/sales/new/review` | F19 | صفحه | ۱.۰ |
| guestreview | تأیید فروش نقدی | [358:520](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-520) | sales (checkout) | `~/sales/new/review` | F19 | حالت | ۱.۰ |
| checkreview | بازبینی فروش با چک | [385:7527](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7527) | sales (checkout) | `~/sales/new/review` | F38 | حالت | ۱.۰ |
| checksplitreview | بازبینی پرداخت ترکیبی با چک | [390:5983](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=390-5983) | sales (checkout) | `~/sales/new/review` | F32/F38 | حالت | ۱.۰ |
| checkform | دریافت چک برای فروش | [385:7382](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7382) | sales (checkout) + cheques | `~/sales/new/payment/cheque` | F38 | صفحه | ۱.۰ |
| invoices | فاکتورهای فروش | [358:534](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-534) | invoices | `~/invoices` | F57 | صفحه | ۱.۰ |
| invoice | فروش ثبت شد | [312:9905](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9905) | invoices | `~/invoices/[invoiceId]` | F20 | صفحه | ۱.۰ |
| invoicecash | فروش نقدی ثبت شد | [312:9937](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9937) | invoices | `~/invoices/[invoiceId]` | F20 | حالت | ۱.۰ |
| invoicechange | فروش با بقیهٔ فوری ثبت شد | [312:9960](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9960) | invoices | `~/invoices/[invoiceId]` | F20 | حالت | ۱.۰ |
| invoicedebt | فروش و دریافت جزئی ثبت شد | [312:9986](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9986) | invoices | `~/invoices/[invoiceId]` | F20 | حالت | ۱.۰ |
| invoicecredit | فروش نسیه ثبت شد | [312:10012](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10012) | invoices | `~/invoices/[invoiceId]` | F20 | حالت | ۱.۰ |
| guestinvoice | فروش ثبت شد | [358:521](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-521) | invoices | `~/invoices/[invoiceId]` | F20 | حالت | ۱.۰ |
| checkdone | فروش و چک ثبت شد | [385:7596](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7596) | invoices | `~/invoices/[invoiceId]` | F38 | حالت | ۱.۰ |
| invoicecheque | فاکتور فروش با چک | [385:7657](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7657) | invoices | `~/invoices/[invoiceId]` | F38 | حالت | ۱.۰ |
| checksplitdone | فروش با پرداخت ترکیبی ثبت شد | [390:6052](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=390-6052) | invoices | `~/invoices/[invoiceId]` | F32/F38 | حالت | ۱.۰ |
| salecorrection | اصلاح اشتباه فاکتور | [358:551](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-551) | invoices | `~/invoices/[invoiceId]/correction` | F60 | صفحه | ۱.۰ |
| receiptcustomer | مشتری فاکتور | [358:522](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-522) | invoices | `~/invoices/[invoiceId]/customer` | F20 | صفحه | ۱.۰ |
| receiptshare | نسخه قابل اشتراک | [358:524](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-524) | invoices | `~/invoices/[invoiceId]/share` | F57 | صفحه | ۱.۰ |
| sms | پیامک فاکتور | [358:523](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-523) | invoices | `~/invoices/[invoiceId]/sms` | F20 | صفحه | ۱.۰ |
| customers | مشتریان و بدهی | [312:10035](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10035) | customers | `~/customers` | F21 | صفحه | ۱.۰ |
| customer | حساب مریم احمدی | [312:10094](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10094) | customers | `~/customers/[customerId]` | F21 | صفحه | ۱.۰ |
| customercredit | حساب مریم احمدی | [312:10917](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10917) | customers | `~/customers/[customerId]` | F21 | حالت | ۱.۰ |
| customer110 | حساب مریم احمدی | [312:10942](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10942) | customers | `~/customers/[customerId]` | F21 | حالت | ۱.۰ |
| customerarchive | بایگانی مشتری | [358:528](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-528) | customers | `~/customers/[customerId]/archive` | F76 | صفحه | ۱.۰ |
| customeredit | ویرایش مشتری | [358:526](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-526) | customers | `~/customers/[customerId]/edit` | F21 | صفحه | ۱.۰ |
| customermerge | بررسی مشتری تکراری | [358:527](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-527) | customers | `~/customers/[customerId]/merge` | F76 | صفحه | ۱.۰ |
| statement | صورت‌حساب مشتری | [358:531](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-531) | customers | `~/customers/[customerId]/statement` | F76 | صفحه | ۱.۰ |
| customercreate | ثبت مشتری | [358:525](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-525) | customers | `~/customers/new` | F18/F21 | صفحه | ۱.۰ |
| DEBT-03 | گردش نسیه مشتری | [385:7212](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7212) | receivables | `~/customers/[customerId]/debt-history` | F22 | صفحه | ۱.۰ |
| settle | ثبت تسویه بدهی | [312:10185](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10185) | receivables | `~/customers/[customerId]/settle` | F23 | صفحه | ۱.۰ |
| settled | تسویه ثبت شد | [312:10225](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10225) | receivables | `~/customers/[customerId]/settle` | F23 | حالت | ۱.۰ |
| allocation | تخصیص دریافت | [358:530](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-530) | receivables | `~/customers/[customerId]/settle/allocation` | F23 | صفحه | ۱.۰ |
| CRD-S01 | وضعیت بدهی و چک مشتری | [385:7260](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7260) | receivables | `~/customers/[customerId]/standing` | F22/F38 | صفحه | ۱.۰ |
| DEBT-01 | نمای کلی نسیه | [385:7158](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7158) | receivables | `~/debts` | F22 | صفحه | ۱.۰ |
| debtors | بدهکاران و نسیه‌بگیران | [358:529](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-529) | receivables | `~/debts/debtors` | F22 | صفحه | ۱.۰ |
| checks | چک‌های دریافتی | [385:7323](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7323) | cheques | `~/cheques` | F38 | صفحه | ۱.۰ |
| checkdetail | جزئیات چک دریافتی | [385:7794](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7794) | cheques | `~/cheques/[chequeId]` | F38 | صفحه | ۱.۰ |
| checkbounce | ثبت برگشت چک | [385:7974](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7974) | cheques | `~/cheques/[chequeId]/bounce` | F38 | صفحه | ۱.۰ |
| checkbounced | چک برگشتی ثبت شد | [385:8028](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8028) | cheques | `~/cheques/[chequeId]/bounce` | F38 | حالت | ۱.۰ |
| checkcollect | تأیید وصول چک | [385:7866](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7866) | cheques | `~/cheques/[chequeId]/collect` | F38 | صفحه | ۱.۰ |
| checkcollected | چک وصول شد | [385:7916](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7916) | cheques | `~/cheques/[chequeId]/collect` | F38 | حالت | ۱.۰ |
| checkreturn | عودت چک به مشتری | [385:8096](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8096) | cheques | `~/cheques/[chequeId]/return` | F38 | صفحه | ۱.۰ |
| checkreturned | عودت چک ثبت شد | [385:8146](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8146) | cheques | `~/cheques/[chequeId]/return` | F38 | حالت | ۱.۰ |
| checkimage | تصویر چک | [385:8205](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8205) | cheques | شیت تصویر چک در فرم چک | F38 | شیت | ۱.۰ |
| checkimageReady | تصویر چک انتخاب شد | [385:8248](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8248) | cheques | شیت تصویر چک در فرم چک | F38 | حالت | ۱.۰ |
| checksettle | دریافت چک بابت بدهی | [385:7458](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7458) | cheques + receivables | `~/customers/[customerId]/settle/cheque` | F38 | صفحه | ۱.۰ |
| checksettleReview | بازبینی دریافت چک | [385:7725](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7725) | cheques + receivables | `~/customers/[customerId]/settle/cheque` | F38 | حالت | ۱.۰ |
| report | گزارش فروش و سود | [312:10475](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10475) | reports | `~/reports` | F24 | صفحه | ۱.۰ |
| reportmore | تحلیل فروش و موجودی | [358:537](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-537) | reports | `~/reports/analysis` | F58/F77 | صفحه | ۱.۰ |
| dailyreport | تغییر فروش روزانه | [358:533](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-533) | reports | `~/reports/daily` | F25 | صفحه | ۱.۰ |
| cost | کالاهای نیازمند تکمیل بها | [312:10597](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10597) | reports | `~/reports/data-issues` | F27 | صفحه | ۱.۰ |
| costpreview | اثر تکمیل بها بر گزارش | [312:10629](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10629) | reports | `~/reports/data-issues/[productId]/cost` | F27 | صفحه | ۱.۰ |
| costdone | بهای کالا اصلاح شد | [312:10657](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10657) | reports | `~/reports/data-issues/[productId]/cost` | F27 | حالت | ۱.۰ |
| discountreport | گزارش تخفیف‌ها | [358:539](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-539) | reports | `~/reports/discounts` | F77 | صفحه | ۱.۰ |
| low | کمبود و کالاهای پرفروش | [312:10680](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10680) | reports | `~/reports/low-stock` | F26 | صفحه | ۱.۰ |
| replenish | تنظیم کمبود کالا | [358:535](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-535) | reports | `~/reports/low-stock/[productId]` | F26 | صفحه | ۱.۰ |
| slow | پرفروش، کم‌فروش و راکد | [358:536](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-536) | reports | `~/reports/performance` | F58 | صفحه | ۱.۰ |
| validprofit | سود فروش‌های دارای بهای مشخص | [312:10563](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10563) | reports | `~/reports/profit` | F27 | صفحه | ۱.۰ |
| purchasevssales | خرید در برابر فروش | [358:538](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-538) | reports | `~/reports/purchase-vs-sales` | F77 | صفحه | ۱.۰ |
| salesreport | گزارش فروش | [358:532](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-532) | reports | `~/reports/sales` | F24 | صفحه | ۱.۰ |
| stockhealth | سلامت موجودی | [358:540](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-540) | reports | `~/reports/stock-health` | F77 | صفحه | ۱.۰ |
| actions | اقدام‌های فروشگاه | [358:541](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-541) | action-center | `~/actions` | F59 | صفحه | ۱.۰ |
| actionlater | یادآوری تنظیم شد | [358:542](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-542) | action-center | `~/actions` | F59 | حالت | ۱.۰ |
| actiondone | پیشنهاد بسته شد | [358:543](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-543) | action-center | `~/actions` | F59 | حالت | ۱.۰ |
| export | خروجی اطلاعات | [358:544](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-544) | data-export | `~/settings/export` | F66 | صفحه | ۱.۰ |
| exportdone | خروجی آماده است | [358:545](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-545) | data-export | `~/settings/export` | F66 | حالت | ۱.۰ |
| support | راهنما و پشتیبانی | [358:558](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-558) | support | `~/settings/support` | F78 | صفحه | ۱.۰ |
| supportdone | درخواست ثبت شد | [358:559](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-559) | support | `~/settings/support` | F78 | حالت | ۱.۰ |
| debtmessage | یادآوری بدهی | [385:8290](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8290) | receivables | `~/customers/[customerId]/reminder` | BIZ-CRM-04 | صفحه | ۱.۱ |
| debtmessageDone | نتیجه ارسال یادآوری | [385:8336](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8336) | receivables | `~/customers/[customerId]/reminder` | BIZ-CRM-04 | حالت | ۱.۱ |
| ORD-S01 | سفارش‌ها | [385:6944](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-6944) | orders | `~/orders` | F46 | صفحه | ۳.۰ |
| ORD-S02 | جزئیات سفارش | [385:7005](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7005) | orders | `~/orders/[orderId]` | F46 | صفحه | ۳.۰ |
| orderapproved | سفارش تأیید شد | [385:8727](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8727) | orders | `~/orders/[orderId]` | F46 | حالت | ۳.۰ |
| orderreject | رد سفارش | [385:8777](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8777) | orders | `~/orders/[orderId]` | F46 | حالت | ۳.۰ |
| PAY-S01 | بررسی فیش | [385:7058](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7058) | orders | `~/orders/[orderId]/slip` | F48 | صفحه | ۳.۰ |
| slipapproved | پرداخت تأیید شد | [385:8820](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8820) | orders | `~/orders/[orderId]/slip` | F48 | حالت | ۳.۰ |
| slipreject | عدم تطابق فیش | [385:8859](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8859) | orders | `~/orders/[orderId]/slip` | F48 | حالت | ۳.۰ |
| colorstock | موجودی مدادرنگی | [312:9295](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9295) | — | نمونه QA مدادرنگی (نه مسیر) | F12 | حالت | نمونه QA |
| colorsuccess | مدادرنگی آمادهٔ فروش است | [312:9329](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9329) | — | نمونه QA مدادرنگی (نه مسیر) | F12 | حالت | نمونه QA |
| colorsale | فروش مدادرنگی | [312:9352](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9352) | — | نمونه QA مدادرنگی (نه مسیر) | F12 | حالت | نمونه QA |
| colorinvoice | فروش مدادرنگی ثبت شد | [312:9386](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9386) | — | نمونه QA مدادرنگی (نه مسیر) | F12 | حالت | نمونه QA |
| edit | اصلاح اشتباه ثبت | [312:10412](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10412) | invoices | — (جایگزین‌شده با salecorrection) | F60 | صفحه | خارج از MVP |
| editdone | اصلاح با سابقه ثبت شد | [312:10452](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10452) | invoices | — (جایگزین‌شده با salecorrection) | F60 | حالت | خارج از MVP |
| settleover | اضافه دریافت تسویه | [312:11017](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-11017) | — | خارج از MVP (اعتبار مثبت ۲.۰، BIZ-CRM-08) | — | حالت | خارج از MVP |
| openingdebt | بدهی ابتدای کار مشتری | [312:10124](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10124) | — | خارج از MVP (افتتاحیه ۲.۰، BIZ-CRM-03) | F41 | صفحه | خارج از MVP |
| openingdebtdone | بدهی افتتاحیه ثبت شد | [312:10162](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10162) | — | خارج از MVP (افتتاحیه ۲.۰، BIZ-CRM-03) | F41 | حالت | خارج از MVP |
| customeropening | حساب مریم احمدی | [312:10967](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10967) | — | خارج از MVP (افتتاحیه ۲.۰، BIZ-CRM-03) | F41 | حالت | خارج از MVP |
| refunddue | مبلغ قابل‌برگشت | [312:9824](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9824) | — | خارج از MVP (برگشت وجه، D21) | — | صفحه | خارج از MVP |
| refund | برگشت وجه به مشتری | [312:9848](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9848) | — | خارج از MVP (برگشت وجه، D21) | — | صفحه | خارج از MVP |
| refundresult | برگشت وجه ثبت شد | [312:9882](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9882) | — | خارج از MVP (برگشت وجه، D21) | — | حالت | خارج از MVP |
| customerrefund | حساب مریم احمدی | [312:10992](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10992) | — | خارج از MVP (برگشت وجه، D21) | — | حالت | خارج از MVP |
| return | مرجوعی از فاکتور | [312:10248](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10248) | — | خارج از MVP (مرجوعی واقعی، D21) | — | صفحه | خارج از MVP |
| returnlarge | مرجوعی بیشتر از بدهی | [312:10291](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10291) | — | خارج از MVP (مرجوعی واقعی، D21) | — | صفحه | خارج از MVP |
| returndamaged | مرجوعی کالای معیوب | [312:10317](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10317) | — | خارج از MVP (مرجوعی واقعی، D21) | — | صفحه | خارج از MVP |
| returndone | مرجوعی ثبت شد | [312:10343](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10343) | — | خارج از MVP (مرجوعی واقعی، D21) | — | حالت | خارج از MVP |
| returnlargedone | مرجوعی و طلب مشتری ثبت شد | [312:10366](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10366) | — | خارج از MVP (مرجوعی واقعی، D21) | — | حالت | خارج از MVP |
| damageddone | مرجوعی معیوب ثبت شد | [312:10389](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10389) | — | خارج از MVP (مرجوعی واقعی، D21) | — | حالت | خارج از MVP |
| return410 | مرجوعی از فاکتور ۱۰۲۴ | [312:11043](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-11043) | — | خارج از MVP (مرجوعی واقعی، D21) | — | صفحه | خارج از MVP |
| return410done | مرجوعی فاکتور ۱۰۲۴ ثبت شد | [312:11082](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-11082) | — | خارج از MVP (مرجوعی واقعی، D21) | — | حالت | خارج از MVP |

## پیوست ب — نگاشت فریم‌های مشتری موبایل (صفحه‌های 20b و 11)

صفحه «20b — نسخه 1.2 · مشتری موبایل» (`310:378`) مرجع اصلی نسخه ۱.۲ است؛ صفحه «11 — Customer App» (`235:2257`) طرح قدیمی‌تر است و برای ناوبری پایین، فیلتر خریدها، فهرست بدهی‌ها و صفحات ۳.۰ استفاده می‌شود.

| فریم | عنوان | Node | ماژول | مسیر | فرآیند | نوع | نسخه |
|---|---|---|---|---|---|---|---|
| AUTH-01 | ورود با شماره موبایل | [310:379](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-379) | auth | `/login` | F33 | صفحه | ۱.۲ |
| AUTH-01-ERROR | شماره موبایل نامعتبر | [405:9728](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-9728) | auth | `/login` | F33 | حالت | ۱.۲ |
| AUTH-02 | کد ورود پیامکی | [310:396](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-396) | auth | `/login/otp` | F33 | صفحه | ۱.۲ |
| AUTH-02-ERROR | کد ناقص یا غیرعددی | [405:9750](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=405-9750) | auth | `/login/otp` | F33 | حالت | ۱.۲ |
| otp-wrong | کد ورود درست نیست | [310:421](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-421) | auth | `/login/otp` | F33 | حالت | ۱.۲ |
| otp-expired | مهلت کد تمام شد | [394:9642](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=394-9642) | auth | `/login/otp` | F33 | حالت | ۱.۲ |
| otp-limited | کمی صبر کنید | [394:9659](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=394-9659) | auth | `/login/otp` | F33 | حالت | ۱.۲ |
| otp-send-failed | کد ارسال نشد | [394:9674](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=394-9674) | auth | `/login/otp` | F33 | حالت | ۱.۲ |
| customerhome | حساب من | [310:436](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-436) | buyer-account | `/` | F33/F79 | صفحه | ۱.۲ |
| buyernavigation | حساب مشتری | [367:40](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-40) | buyer-account | `/account` | F33 | صفحه | ۱.۲ |
| debt | گردش حساب من | [310:508](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-508) | buyer-account | `/stores/[storeId]` | F34 | صفحه | ۱.۲ |
| purchases | خریدهای من | [310:465](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-465) | buyer-invoices | `/purchases` | F33 | صفحه | ۱.۲ |
| invoice | جزئیات خرید | [310:485](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-485) | buyer-invoices | `/purchases/[invoiceId]` | F33 | صفحه | ۱.۲ |
| settlementrequest | درخواست ثبت پرداخت | [367:35](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-35) | buyer-settlements | `/stores/[storeId]/settle` | F34 | صفحه | ۱.۲ |
| requesttimeline | پیگیری درخواست تسویه | [367:36](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-36) | buyer-settlements | `/settlements/[requestId]` | F34 | صفحه | ۱.۲ |
| dispute | اعلام مغایرت | [310:532](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-532) | buyer-claims | `/claims/new` | F35 | صفحه | ۱.۲ |
| claim | این فاکتور متعلق به من نیست | [367:39](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-39) | buyer-claims | `/claims/new?target=invoice` | F79 | حالت | ۱.۲ |
| disputedone | مغایرت برای بررسی ثبت شد | [310:555](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=310-555) | buyer-claims | `/claims/done` | F35 | صفحه | ۱.۲ |
| profile | اطلاعات حساب من | [367:37](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-37) | buyer-profile | `/account/profile` | F33/F69 | صفحه | ۱.۲ |
| buyersessions | دستگاه‌های من | [367:38](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-38) | buyer-profile | `/account/sessions` | F33 | صفحه | ۱.۲ |
| AUTH-C01 | ورود مشتری (با رمز) | [268:2](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-2) | — | — (لغو: فقط OTP، تصمیم 2.4.0) | F69 | مرجع | خارج از دامنه |
| CUS-C01 | خانه مشتری | [268:19](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-19) | buyer-account | `/` (مرجع ناوبری پایین و خلاصه) | F33 | مرجع | ۱.۲ |
| CUS-C02 | خریدها | [268:59](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-59) | buyer-invoices | `/purchases` (فیلتر همه/بدهکار/تسویه‌شده) | F33 | مرجع | ۱.۲ |
| CUS-C03 | جزئیات فاکتور | [268:106](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-106) | buyer-invoices | `/purchases/[invoiceId]` (دانلود فاکتور) | F33 | مرجع | ۱.۲ |
| CUS-C04 | بدهی‌ها | [268:145](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-145) | buyer-account | `/debts` | F34 | صفحه | ۱.۲ |
| CUS-C05 | ثبت تسویه | [268:185](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-185) | buyer-settlements | `/stores/[storeId]/settle` | F34 | مرجع | ۱.۲ |
| ORD-C01 | فروشگاه و کالاها | [268:228](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-228) | storefront | `/shop/[storeId]` | F45 | صفحه | ۳.۰ |
| ORD-C02 | سبد و تحویل | [268:275](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-275) | buyer-cart / checkout | `/shop/[storeId]/checkout` | F46/F80 | صفحه | ۳.۰ |
| ORD-C05 | پیگیری سفارش | [268:303](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-303) | buyer-orders | `/orders/[orderId]` | F49 | صفحه | ۳.۰ |
| CRD-C01 | رتبه اعتباری | [268:345](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=268-345) | — | — (دامنه ۳.۱/آینده) | F65 | مرجع | خارج از دامنه |

## پیوست ج — نگاشت فریم لندینگ (صفحه 13)

| فریم | عنوان | Node | ماژول | مسیر | فرآیند | نوع | نسخه |
|---|---|---|---|---|---|---|---|
| LAND-D01 | Landing Desktop (۱۴۴۰×۱۹۰۰) | [274:3](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=274-3) | marketing | `/` | F64 | صفحه | ۱.۰ |

بخش‌های LAND-D01: Navigation (`274:4`)، Hero (`274:13`)، Features (`274:32`)، Two products (`274:48`)، Trust (`274:59`)، Footer (`274:64`). نسخه موبایل همان بخش‌ها را تک‌ستونی و به ترتیب Hero ← قابلیت‌ها ← دو اپ ← اعتماد چیده می‌کند.
