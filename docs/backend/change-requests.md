# درخواست‌های تغییر بک‌اند (BCR)

> بازنگری 2.5.0 — ۱۴۰۵/۰۷/۰۵. مبنا: کد و اسناد بک‌اند در [`../../backend/`](./) (کامیت `b12df9c`) و تصمیم‌های [`../business/orders-services-membership.md`](../business/orders-services-membership.md).
>
> **قاعده کار فرانت:** بک‌اند معیار است. هرجا تصمیم کسب‌وکاری تازه با بک‌اند فعلی فرق دارد، فرانت از قرارداد فعلی API استفاده می‌کند و تفاوت را فقط در **Adapter** همان ماژول پنهان می‌کند؛ با اعمال هر BCR فقط همان Adapter و DTOهای تولیدشده تغییر می‌کنند.

## فهرست

| شناسه | موضوع | اولویت | نسخه محصول | اثر روی فرانت تا اعمال |
|---|---|---|---|---|
| BCR-01 | پول Decimal بدون ریال/تومان | بالا | ۱.۰ | ✅ **اعمال شد (2026-09-30):** بک‌اند `decimal` و `…Amount` به تومان، JSON رشته‌ای؛ Adapter فرانت رشته را بی‌تغییر می‌خواند |
| BCR-02 | نوع قلم «خدمت» | بالا | ۱.۰ | ✅ **اعمال شد (2026-09-30)** در بک‌اند؛ UI ثبت خدمت در فرانت هنوز ساخته نشده |
| BCR-03 | میان‌بر قلم (Shortcut) | متوسط | ۱.۰ | ✅ **اعمال شد (2026-09-30):** `Shortcut` یکتا در فروشگاه؛ `q` دقیقاً روی میان‌بر هم جست‌وجو می‌کند |
| BCR-04 | عضویت در فروشگاه | متوسط | ۳.۰ | ✅ **اعمال شد (2026-09-30):** `GET/POST/DELETE /customer/memberships`؛ خودکار از خرید حضوری، لینک فاکتور و ثبت سفارش |
| BCR-05 | ادغام شیوه دریافت به دو شیوه | متوسط | ۳.۰ | ✅ **اعمال شد (2026-09-30):** `PlaceOrderRequest.Method` + `Carrier`؛ DTOها `Channel` داخلی + `Method`/`Carrier` |
| BCR-06 | پیش‌سفارش | متوسط | ۳.۰ | ✅ **اعمال شد (2026-09-30):** `PUT …/products/{id}/pre-order`، `PlaceOrderRequest.PreOrder`، `POST …/orders/{id}/pre-order/hold` |
| BCR-07 | محور وضعیت پرداخت سفارش | پایین | ۳.۰ | ✅ **اعمال شد (2026-09-30):** `PaymentState` در `OrderMoneyDto` و `OrderSummaryDto` |
| BCR-08 | سفارش خدماتی پرینت | بالا برای ۳.۰ | ۳.۰ | ✅ **اعمال شد (2026-09-30)** در بک‌اند؛ بارگذاری روی MinIO واقعی هنوز آزموده نشده |
| BCR-09 | وضعیت «در انتظار قیمت‌گذاری» | بالا برای ۳.۰ | ۳.۰ | ✅ **اعمال شد (2026-09-30):** `AwaitingQuote` + `POST …/orders/{id}/quote` |
| BCR-10 | نگهداری و دسترسی فایل مشتری | بالا برای ۳.۰ | ۳.۰ | ✅ **اعمال شد (2026-09-30):** فایل خصوصی، لینک ۱۵ دقیقه‌ای، Job حذف پس از مدت نگهداری |
| BCR-11 | لینک فاکتور پیامکی با OTP | متوسط | ۱.۲ | ✅ **اعمال شد (2026-09-30):**<br>• `GET /public/invoices/{token}/summary` فقط فروشگاه، شماره، تاریخ و موبایل پوشیده را برمی‌گرداند.<br>• فاکتور کامل با `GET /customer/invoices/by-token/{token}` پس از OTP همان شماره باز می‌شود.<br>• ساخت عضویت پس از ورود با BCR-04 انجام می‌شود. |
| BCR-12 | رضایت پیامک تبلیغاتی جدا از عضویت | پایین | ۳.۱ | ✅ **اعمال شد (2026-09-30):** `GET /customer/marketing-consents` و `PUT …/{storeId}`؛ ارسال پیامک تبلیغاتی هنوز وجود ندارد |
| BCR-13 | endpoint عمومی بارگذاری فایل | بالا | ۱.۰ | ✅ **اعمال شد (2026-09-30):** `POST …/files` (ضمیمهٔ خرید، تصویر کالا، تصویر چک)؛ Adapter فرانت تایپ‌دار شد |

---

## BCR-01 — پول Decimal و یک واحد ✅ اعمال شد

> **وضعیت 2026-09-30:** در شاخهٔ `fix/business-alignment` هر دو مخزن اعمال شد:
> - `Money(decimal Amount)`، ستون‌ها `numeric(18,2)` و فیلدها `…Amount`.
> - decimalها (پول و مقدار) در JSON به‌صورت رشته.
> - `.Money()` در Validatorها با حداکثر دو رقم اعشار.
> - همهٔ ÷۱۰ و ×۱۰ حذف شد: پیامک، پیام‌ها و خروجی. در ورود Excel فقط فایل «ریال» ÷۱۰ می‌شود.
>
> متن زیر طرح اولیه است.

**وضع فعلی:** `Money(long Rials)`؛ همه DTOها فیلد `…Rials` از نوع `int64` دارند (۴۴۶ فیلد در `openapi.json`)؛ سند می‌گوید «UI تومان نشان می‌دهد (Rials / 10)».

**تغییر:**
- `Money(decimal Amount)` با `numeric(18,2)` در دیتابیس؛ حذف هر تبدیل ریال/تومان.
- نام فیلدها `…Rials` ← `…Amount` (مثل `TotalAmount`، `UnitPriceAmount`) و نوع `decimal`. در JSON به‌صورت **رشته** (`"410000.00"`) سریال شود تا دقت در JavaScript از دست نرود (`JsonNumberHandling.WriteAsString`).
- `Money.Allocate` برای تخصیص تخفیف روی Decimal با گام ۰٫۰۱ یا گام تنظیم‌شده فروشگاه.
- Validator مشترک `.MoneyRials()` ← `.Money()`.

**فرانت تا اعمال:** Adapter `fromApiMoney(int64)` مقدار را بی‌تغییر (بدون تقسیم) به `Money` Decimal تبدیل می‌کند و `toApiMoney` برعکس، با خطای صریح برای کسر اعشاری تا بک‌اند Decimal شود.

## BCR-02 — نوع قلم «خدمت» ✅ اعمال شد

> **وضعیت 2026-09-30:**
> - `ItemKind { Goods, Service }` روی `CatalogItem` (خدمت فقط خصوصی فروشگاه) و `StoreProduct`، به‌علاوهٔ snapshot روی `InvoiceLine.Kind`.
> - Ledger برای خدمت موجودی، حرکت و رزرو ثبت نمی‌کند؛ رسید خرید، تعدیل و شمارش خدمت را رد می‌کنند.
> - گزارش کمبود، سلامت و ارزش موجودی، راکد، خروجی موجودی و مرکز اقدام فقط کالا را می‌شمارند.
> - بهای خدمت با `ServiceCostAmount` در ثبت یا `PUT …/local` تعیین می‌شود؛ خالی یعنی نامعلوم.
> - فیلدهای جدید: `Kind`، `Shortcut` و `ServiceCostAmount` در DTOها؛ `ProductListQuery.kind` و `shortcut`.
> - Seed 1.1.0: واحدهای صفحه، برگ، ساعت و نوبت؛ دستهٔ «خدمات» و نوع‌های «پرینت و کپی»، «صحافی و پرس» و «خدمت».

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

> **پیاده‌سازی 2026-09-30:**
> - موجودیت `StoreMembership` در ماژول CustomerPortal؛ یکتا روی (کاربر، فروشگاه). ترک عضویت ردیف را با `LeftAt` نگه می‌دارد.
> - خرید حضوری هنگام `GET /customer/memberships` عضویت `InStorePurchase` می‌سازد؛ مشتری با ادعای «مال من نیست» روی آن پرونده، یا مشتری‌ای که قبلاً عضویت را ترک کرده، دوباره عضو نمی‌شود.
> - لینک فاکتور (`by-token`) عضویت `InvoiceLink` و ثبت سفارش عضویت `Qr` می‌سازد؛ این دو کار صریح‌اند و عضویتِ ترک‌شده را دوباره فعال می‌کنند.
> - `CustomerMembershipDto` نام فروشگاه، لوگو، `PublicCode` و `AcceptingOrders` را برمی‌گرداند.
> - ماژول‌ها از طریق قراردادهای `IStoreMemberships` و `IStorefrontDirectory` در ماژول Stores به هم وصل‌اند و به یکدیگر ارجاع مستقیم ندارند.

## BCR-05 — دو شیوه دریافت

- `enum FulfillmentMethod { StorePickup, AddressDelivery }` و `enum DeliveryCarrier { StoreCourier, Post }` برای `AddressDelivery`.
- نگاشت مهاجرت: `InStore`/`Pickup` ← `StorePickup`؛ `LocalDelivery` ← `AddressDelivery + StoreCourier`؛ `Shipping` ← `AddressDelivery + Post`.
- `StorefrontSettings`: `StorePickupEnabled`، `AddressDeliveryEnabled`، هزینه و محدوده برای هر حامل.

**فرانت تا اعمال:** UI مشتری دو گزینه نشان می‌دهد و در Adapter به `Pickup` یا `LocalDelivery`/`Shipping` (بسته به تنظیم فعال فروشگاه) نگاشت می‌کند.

> **پیاده‌سازی 2026-09-30:**
> - چهار مقدار قبلی با نام `FulfillmentChannel` به‌عنوان «کانال اجرایی» فروشنده باقی ماندند؛ تنظیمات فروشگاه همان چهار کلید را دارند.
> - مشتری `Method` (`StorePickup` یا `AddressDelivery`) و برای ارسال `Carrier` (`StoreCourier` یا `Post`) می‌فرستد.
> - `StorefrontSettings.ResolveChannel` انتخاب مشتری را به کانال فعال فروشگاه نگاشت می‌کند:
>   - تحویل در فروشگاه با بازهٔ زمانی ← `Pickup`؛ بدون بازه ← `InStore`.
>   - ارسال بدون حامل ← پیک فروشگاه اگر فعال باشد، وگرنه پست.
> - `OrderDto`، `OrderSummaryDto` و `ShopMethodDto` فیلد `Channel` را همراه با `Method` و `Carrier` محاسبه‌شده دارند.
> - فیلتر فهرست سفارش فروشنده (`method`) روی `FulfillmentMethod` است.

## BCR-06 — پیش‌سفارش

- `OrderKind { Regular, PreOrder }` و `Order.PromisedDate`.
- روی `StoreProduct`: `AllowPreOrder` و `PreOrderLeadDays` (موعد تقریبی).
- پیش‌سفارش تا تأیید فروشنده رزرو نمی‌سازد؛ `ShopProductDto.PreOrder { Allowed, LeadDays }`.

> **پیاده‌سازی 2026-09-30:**
> - فروشنده: `PUT …/products/{id}/pre-order { allowed, leadDays }` (۱ تا ۳۶۵ روز؛ برای خدمت مجاز نیست).
> - مشتری: `PlaceOrderRequest.PreOrder = true`.
>   - هر ردیف کالایی که موجودی کافی ندارد باید پیش‌سفارش را بپذیرد؛ در غیر این صورت `PREORDER_NOT_ALLOWED`.
>   - `PromisedDate` برابر امروز (به وقت تهران) به‌علاوهٔ بیشترین `LeadDays` است.
> - تأیید فروشنده رزرو نمی‌سازد. با رسیدن کالا، `POST …/orders/{id}/pre-order/hold` همهٔ اقلام را یک‌جا رزرو می‌کند.
> - آماده‌سازی بدون رزرو مجاز است. آماده تحویل، ارسال با پیک، ارسال پستی و تحویل بدون رزرو خطای `PREORDER_NOT_RESERVED` می‌دهند.

## BCR-07 — محور وضعیت پرداخت

- `enum OrderPaymentState { Unpaid, PendingReview, DepositPaid, PartiallyPaid, Paid, RefundPending }` در `OrderDto` و `OrderSummaryDto`، محاسبه‌شده در `OrderMath`.

> **پیاده‌سازی 2026-09-30:**
> - `Order.RefundedAmount` تازه اضافه شد و با Paid شدن هر استرداد بالا می‌رود.
> - `RefundPending` یعنی تعهد استردادِ پرداخت‌نشده؛ قبلاً تعهد استرداد فقط بالا می‌رفت.
> - `OrderMoneyDto` دو فیلد `RefundedAmount` و `PaymentState` گرفت.

## BCR-08 — سفارش خدماتی پرینت

- `OrderLine.ServiceSpec` (jsonb، نسخه‌دار با `OrderLine.VersionNo`):
  `PrintSpec { Defaults: PrintOptions, Files: [PrintFile { FileId, PageCount?, PageRanges?, Override?: PrintOptions }], Finishing: [FinishingOption] }`
  `PrintOptions { PaperSize: A4|A3, Color: Mono|Color, Sides: Simplex|Duplex, Copies }`.
- `POST /shop/{storeId}/uploads` (multipart، PDF/JPG/PNG، سقف حجم) ← `FileId` و `PageCount` تشخیص‌داده‌شده برای PDF.
- محاسبه `PrintedPages` و `Sheets` در سرور (BIZ-PRN-09) و برگرداندن هر دو در `OrderLineDto`.
- تعرفه چاپ فروشگاه: `ordering.print_tariffs(store_id, paper_size, color, sides, unit_price_amount)` و `ordering.finishing_options(store_id, key, title, price_amount, per ∈ {Copy, Order})`؛ API تنظیم فروشنده `…/storefront/print-settings`.
- `POST /shop/{storeId}/print/quote` برای پیش‌نمایش مبلغ پیش از ثبت.

> **پیاده‌سازی 2026-09-30** (در جزئیات با پیشنهاد بالا فرق دارد):
>
> **مشتری**
> - `GET /shop/{id}/print/options`: گزینه‌هایی که فروشگاه ارائه می‌کند (BIZ-PRN-03).
> - `POST /shop/{id}/print/uploads`:
>   - PDF، JPG یا PNG تا ۵۰MB.
>   - تعداد صفحهٔ PDF را سرور از اشیای Page تشخیص می‌دهد؛ برای PDF با object stream فشرده مقدار null می‌شود و قیمت به قیمت‌گذاری فروشنده می‌رود.
> - `POST /shop/{id}/print/quote`: پیش‌نمایش مبلغ.
> - `POST /shop/{id}/print/cart`: افزودن کار چاپ به سبد، همیشه به‌صورت ردیف جدا.
> - نام و تعداد صفحهٔ فایل همیشه از رکورد `ordering.print_uploads` خوانده می‌شود، هرگز از ورودی مشتری.
>
> **ردیف سفارش**
> - روی همان خدمتی ثبت می‌شود که فروشنده به‌عنوان «خدمت چاپ» انتخاب کرده است.
> - تعداد ۱ است و مبلغ = جمع کار.
> - `PrintSpec` (jsonb)، `PriceKnown`، `PrintedPages` و `Sheets` در `OrderLineDto` برمی‌گردند.
>
> **فروشنده**
> - `GET/PUT …/storefront/print-settings`.
> - تعرفه‌ها و خدمات تکمیلی به‌جای دو جدول جدا، به‌صورت jsonb روی `ordering.print_settings` ذخیره می‌شوند (پیکربندی کوچک).
> - تعرفه با مبلغ null یعنی «ارائه می‌شود، ولی قیمت را فروشنده اعلام می‌کند».
>
> **باز**
> - کسر برگ مصرفی از موجودی کاغذ انجام نمی‌شود؛ `Sheets` فقط گزارش می‌شود.
> - بارگذاری روی MinIO واقعی آزموده نشده، چون MinIO روی این ماشین قابل دانلود نبود.

## BCR-09 — «در انتظار قیمت‌گذاری»

- `OrderStatus.AwaitingQuote`؛ ورود وقتی هر ردیف خدمت `PriceKnown=false` باشد.
- `POST …/orders/{orderId}/quote` (فروشنده: مبلغ هر ردیف + `ReadyAt`) ← `AwaitingCustomer` با نسخه تازه؛ پذیرش مشتری با همان `revision/accept`.
- تغییر مؤثر پس از تأیید فقط از مسیر revision (BIZ-PRN-05).

> **پیاده‌سازی 2026-09-30:**
> - سفارشی که ردیف بی‌قیمت دارد، همان هنگام ثبت به `AwaitingQuote` می‌رود و در مرکز اقدام فروشنده هم دیده می‌شود.
> - `POST …/orders/{id}/quote { version, lines:[{lineId, unitPriceAmount}], readyAt, note }` یک نسخهٔ اصلاحی با `ChangePrice` می‌سازد.
>   - اگر ردیفی بی‌قیمت بماند، خطای `ORDER_QUOTE_INCOMPLETE` برمی‌گردد.
> - سفارش `AwaitingQuote` مستقیم تأیید نمی‌شود.

## BCR-10 — فایل مشتری

- `FileKind.CustomerOrderFile` خصوصی؛ دانلود فقط با لینک موقت برای مالک سفارش و عضو فروشگاه با `order.manage`.
- Job حذف پس از `retention_days` (تنظیم فروشگاه، پیش‌فرض ۳۰) از تحویل/لغو؛ رکورد فایل با `DeletedAt` باقی می‌ماند.
- جایگزینی فایل پس از `InProgress` فقط از مسیر revision.

> **پیاده‌سازی 2026-09-30:**
>
> **ذخیره و حذف**
> - `platform.files` ستون `DeletedAt` گرفت و `IFileStorage.DeleteAsync` بایت‌ها را حذف می‌کند. فایل حذف‌شده دیگر لینک نمی‌گیرد.
> - `PrintFileRetentionJob` ساعتی اجرا می‌شود:
>   - فایل سفارشِ بسته‌شده را پس از `FileRetentionDays` (پیش‌فرض ۳۰) حذف می‌کند.
>   - فایلی را که هرگز سفارش نشده، پس از ۷ روز حذف می‌کند.
>
> **دسترسی**
> - مشتری: `GET /customer/orders/{id}/files/{fileId}`.
> - فروشنده با `order.manage`: `GET …/orders/{id}/files/{fileId}`.
> - خروجی هر دو لینک امضاشدهٔ ۱۵ دقیقه‌ای است.
>
> **جایگزینی فایل**
> - مشتری مسیری برای ویرایش سفارش ندارد؛ هر تغییری فقط از مسیر revision فروشنده انجام می‌شود.

## BCR-11 — لینک فاکتور پیامکی

- لینک پیامک: `/i/{token}`؛ `GET /public/invoices/{token}/summary` بدون اقلام و مبلغ دقیق (فقط نام فروشگاه و شماره) و `GET /customer/invoices/by-token/{token}` پس از OTP که مالکیت شماره را کنترل کند (BIZ-MBR-02، BIZ-BUY-05). پس از ورود موفق، عضویت با `source=InvoiceLink` ساخته می‌شود.

## BCR-12 — رضایت تبلیغاتی

- `portal.marketing_consents(user_id, store_id, granted_at, revoked_at, channel)` مستقل از عضویت.

> **پیاده‌سازی 2026-09-30:**
> - `GET /customer/marketing-consents` و `PUT /customer/marketing-consents/{storeId} { granted }`.
> - کانال فعلاً `Sms` است و فقط خود مشتری آن را تنظیم می‌کند.
> - ارسال پیامک تبلیغاتی (نسخهٔ ۳.۱) هنوز ساخته نشده است.

## BCR-13 — بارگذاری فایل

**وضع فعلی:** `PUT …/purchases/{purchaseId}/attachments` و `CreateCatalogItemRequest.imageFileIds` شناسه فایل می‌گیرند، ولی endpoint عمومی بارگذاری فایل وجود ندارد (فقط لوگوی فروشگاه و فایل Import و فیش سفارش/تسویه بارگذاری مستقیم دارند).

**تغییر:** `POST /api/v1/stores/{storeId}/files` (multipart: `File`, `Kind ∈ { PurchaseAttachment, ProductImage, ChequeImage }`) ← `{ fileId, url, contentType, size }` با همان محدودیت‌های `FileRule` (تصویر ۱۰MB، PDF). فرانت از Port `FileUploader` استفاده می‌کند و فقط Adapter آن تغییر می‌کند.

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
