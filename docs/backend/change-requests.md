# درخواست‌های تغییر بک‌اند (BCR)

> بازنگری 2.5.0 — ۱۴۰۵/۰۷/۰۵. مبنا: کد و اسناد بک‌اند در [`../reference/backend/`](../reference/backend/) (کامیت `b12df9c`) و تصمیم‌های [`../business/orders-services-membership.md`](../business/orders-services-membership.md).
>
> **قاعده کار فرانت:** بک‌اند معیار است. هرجا تصمیم کسب‌وکاری تازه با بک‌اند فعلی فرق دارد، فرانت از قرارداد فعلی API استفاده می‌کند و تفاوت را فقط در **Adapter** همان ماژول پنهان می‌کند؛ با اعمال هر BCR فقط همان Adapter و DTOهای تولیدشده تغییر می‌کنند.

## فهرست

| شناسه | موضوع | اولویت | نسخه محصول | اثر روی فرانت تا اعمال |
|---|---|---|---|---|
| BCR-01 | پول Decimal بدون ریال/تومان | بالا | ۱.۰ | Adapter پول: `long` فعلی بدون تقسیم به Decimal تبدیل می‌شود |
| BCR-02 | نوع قلم «خدمت» | بالا | ۱.۰ | ثبت و فروش خدمت پشت `ReleaseGate` تا اعمال |
| BCR-03 | میان‌بر قلم (Shortcut) | متوسط | ۱.۰ | جست‌وجوی سبد روی عنوان و SKU |
| BCR-04 | عضویت در فروشگاه | متوسط | ۳.۰ | «فروشگاه‌های من» فعلاً از `GET /customer/stores` |
| BCR-05 | ادغام شیوه دریافت به دو شیوه | متوسط | ۳.۰ | نگاشت چهار مقدار به دو گروه در UI |
| BCR-06 | پیش‌سفارش | متوسط | ۳.۰ | پنهان |
| BCR-07 | محور وضعیت پرداخت سفارش | پایین | ۳.۰ | مشتق از `OrderMoneyDto` |
| BCR-08 | سفارش خدماتی پرینت | بالا برای ۳.۰ | ۳.۰ | پنهان |
| BCR-09 | وضعیت «در انتظار قیمت‌گذاری» | بالا برای ۳.۰ | ۳.۰ | پنهان |
| BCR-10 | نگهداری و دسترسی فایل مشتری | بالا برای ۳.۰ | ۳.۰ | — |
| BCR-11 | لینک فاکتور پیامکی با OTP | متوسط | ۱.۲ | لینک عمومی فعلی `GET /public/invoices/{token}` |
| BCR-12 | رضایت پیامک تبلیغاتی جدا از عضویت | پایین | ۳.۱ | — |

---

## BCR-01 — پول Decimal و یک واحد

**وضع فعلی:** `Money(long Rials)`؛ همه DTOها فیلد `…Rials` از نوع `int64` دارند (۴۴۶ فیلد در `openapi.json`)؛ سند می‌گوید «UI تومان نشان می‌دهد (Rials / 10)».

**تغییر:**
- `Money(decimal Amount)` با `numeric(18,2)` در دیتابیس؛ حذف هر تبدیل ریال/تومان.
- نام فیلدها `…Rials` ← `…Amount` (مثل `TotalAmount`، `UnitPriceAmount`) و نوع `decimal`. در JSON به‌صورت **رشته** (`"410000.00"`) سریال شود تا دقت در JavaScript از دست نرود (`JsonNumberHandling.WriteAsString`).
- `Money.Allocate` برای تخصیص تخفیف روی Decimal با گام ۰٫۰۱ یا گام تنظیم‌شده فروشگاه.
- Validator مشترک `.MoneyRials()` ← `.Money()`.

**فرانت تا اعمال:** Adapter `fromApiMoney(int64)` مقدار را بی‌تغییر (بدون تقسیم) به `Money` Decimal تبدیل می‌کند و `toApiMoney` برعکس، با خطای صریح برای کسر اعشاری تا بک‌اند Decimal شود.

## BCR-02 — نوع قلم «خدمت»

**وضع فعلی:** ردیف فاکتور به `StoreProductUnitId` وابسته است و `IStockLedger.IssueAsync` برای همه ردیف‌ها موجودی کم می‌کند.

**تغییر:**
- `enum ItemKind { Goods, Service }` روی `CatalogItem` (و در `StoreProduct` کپی شود برای فیلتر سریع).
- برای `Service`: بدون `stock_levels`، بدون رسید، بدون `IssueAsync`؛ `FindInsufficientAsync` آن را نادیده می‌گیرد؛ از گزارش کمبود، سلامت موجودی، شمارش و ارزش موجودی حذف می‌شود.
- `InvoiceLine.Kind` snapshot شود. `CostKnown=false` برای خدمت بدون بهای تعریف‌شده (BIZ-SRV-04). فیلد اختیاری `StoreProduct.ServiceCostAmount`.
- `RegisterProductRequest` بدون `Stock` برای خدمت؛ Validator: خدمت نمی‌تواند `Stock` یا `Packagings` داشته باشد.
- `ProductListQuery.Kind`، `StoreProductSummaryDto.Kind`، `QuoteLineDto.Kind`، `InvoiceLineDto.Kind`.

## BCR-03 — میان‌بر قلم

- `StoreProduct.Shortcut` (رشته کوتاه، یکتا در فروشگاه، اختیاری؛ مثل `P1`).
- `GET …/products?shortcut=` یا جست‌وجوی `Q` که میان‌بر را دقیق تطبیق دهد و اولویت بدهد.
- `ProductListQuery` و `StoreProductSummaryDto` فیلد `Shortcut` بگیرند.

## BCR-04 — عضویت در فروشگاه

- جدول `portal.store_memberships(user_id, store_id, source, created_at, left_at)` با `source ∈ { Qr, InvoiceLink, InStorePurchase, Nearby }`.
- ساخت خودکار پس از OTP وقتی خرید حضوری معتبر با موبایل تأییدشده وجود دارد (BIZ-MBR-04)؛ ساخت صریح پس از QR.
- `GET /customer/memberships`، `POST /customer/memberships` (با `storeId` یا `publicCode`)، `DELETE /customer/memberships/{storeId}`.
- عضویت هیچ رضایت تبلیغاتی نمی‌سازد (BCR-12).

## BCR-05 — دو شیوه دریافت

- `enum FulfillmentMethod { StorePickup, AddressDelivery }` و `enum DeliveryCarrier { StoreCourier, Post }` برای `AddressDelivery`.
- نگاشت مهاجرت: `InStore`/`Pickup` ← `StorePickup`؛ `LocalDelivery` ← `AddressDelivery + StoreCourier`؛ `Shipping` ← `AddressDelivery + Post`.
- `StorefrontSettings`: `StorePickupEnabled`، `AddressDeliveryEnabled`، هزینه و محدوده برای هر حامل.

**فرانت تا اعمال:** UI مشتری دو گزینه نشان می‌دهد و در Adapter به `Pickup` یا `LocalDelivery`/`Shipping` (بسته به تنظیم فعال فروشگاه) نگاشت می‌کند.

## BCR-06 — پیش‌سفارش

- `OrderKind { Regular, PreOrder }` و `Order.PromisedDate`.
- روی `StoreProduct`: `AllowPreOrder` و `PreOrderLeadDays` (موعد تقریبی).
- پیش‌سفارش تا تأیید فروشنده رزرو نمی‌سازد؛ `ShopProductDto.PreOrder { Allowed, LeadDays }`.

## BCR-07 — محور وضعیت پرداخت

- `enum OrderPaymentState { Unpaid, PendingReview, DepositPaid, PartiallyPaid, Paid, RefundPending }` در `OrderDto` و `OrderSummaryDto`، محاسبه‌شده در `OrderMath`.

## BCR-08 — سفارش خدماتی پرینت

- `OrderLine.ServiceSpec` (jsonb، نسخه‌دار با `OrderLine.VersionNo`):
  `PrintSpec { Defaults: PrintOptions, Files: [PrintFile { FileId, PageCount?, PageRanges?, Override?: PrintOptions }], Finishing: [FinishingOption] }`
  `PrintOptions { PaperSize: A4|A3, Color: Mono|Color, Sides: Simplex|Duplex, Copies }`.
- `POST /shop/{storeId}/uploads` (multipart، PDF/JPG/PNG، سقف حجم) ← `FileId` و `PageCount` تشخیص‌داده‌شده برای PDF.
- محاسبه `PrintedPages` و `Sheets` در سرور (BIZ-PRN-09) و برگرداندن هر دو در `OrderLineDto`.
- تعرفه چاپ فروشگاه: `ordering.print_tariffs(store_id, paper_size, color, sides, unit_price_amount)` و `ordering.finishing_options(store_id, key, title, price_amount, per ∈ {Copy, Order})`؛ API تنظیم فروشنده `…/storefront/print-settings`.
- `POST /shop/{storeId}/print/quote` برای پیش‌نمایش مبلغ پیش از ثبت.

## BCR-09 — «در انتظار قیمت‌گذاری»

- `OrderStatus.AwaitingQuote`؛ ورود وقتی هر ردیف خدمت `PriceKnown=false` باشد.
- `POST …/orders/{orderId}/quote` (فروشنده: مبلغ هر ردیف + `ReadyAt`) ← `AwaitingCustomer` با نسخه تازه؛ پذیرش مشتری با همان `revision/accept`.
- تغییر مؤثر پس از تأیید فقط از مسیر revision (BIZ-PRN-05).

## BCR-10 — فایل مشتری

- `FileKind.CustomerOrderFile` خصوصی؛ دانلود فقط با لینک موقت برای مالک سفارش و عضو فروشگاه با `order.manage`.
- Job حذف پس از `retention_days` (تنظیم فروشگاه، پیش‌فرض ۳۰) از تحویل/لغو؛ رکورد فایل با `DeletedAt` باقی می‌ماند.
- جایگزینی فایل پس از `InProgress` فقط از مسیر revision.

## BCR-11 — لینک فاکتور پیامکی

- لینک پیامک: `/i/{token}`؛ `GET /public/invoices/{token}/summary` بدون اقلام و مبلغ دقیق (فقط نام فروشگاه و شماره) و `GET /customer/invoices/by-token/{token}` پس از OTP که مالکیت شماره را کنترل کند (BIZ-MBR-02، BIZ-BUY-05). پس از ورود موفق، عضویت با `source=InvoiceLink` ساخته می‌شود.

## BCR-12 — رضایت تبلیغاتی

- `portal.marketing_consents(user_id, store_id, granted_at, revoked_at, channel)` مستقل از عضویت.

---

## موارد بدون نیاز به تغییر (تأیید شده)

| موضوع | وضعیت |
|---|---|
| مسیرهای API | `api/v1/stores/{storeId}/…`، `api/v1/customer/…`، `api/v1/shop/{storeId}/…`، `api/v1/admin/…`؛ فرانت شناسه فروشگاه را در مسیر می‌گذارد و هدر `X-Store-Id` ندارد |
| مجوزها | ۱۹ مجوز `StorePermission` و `GET /api/v1/permissions` مرجع فرانت‌اند |
| Idempotency | هدر `Idempotency-Key` (GUID) و `GET …/operations/{operationId}` |
| خطا | ProblemDetails با `code` پایدار؛ `VALIDATION_FAILED` با خطای فیلد camelCase |
| صفحه‌بندی | `CursorPage<T>(Items, NextCursor, TotalCount?)`، `limit ≤ 100` |
| هم‌زمانی | `Version` (uint) در DTOها |
