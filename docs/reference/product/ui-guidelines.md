# راهنمای UI و Design System دکانی

## بازنگری 2.5.0 — خدمت، عضویت، سفارش و پرینت (2026-09-27)

قواعد کامل در [`../../business/orders-services-membership.md`](../../business/orders-services-membership.md). خلاصه اثر روی این سند:

- **بارکد شرط حضور در فاکتور نیست**؛ فقط یکی از راه‌های پیداکردن قلم است (BIZ-SRV-03).
- **خدمت** مثل کالا یک ردیف فاکتور دارد: عنوان، تعداد، واحد، قیمت واحد و مبلغ نهایی؛ مثلاً «پرینت سیاه‌وسفید A4 — ۲۰ صفحه». خدمت با نام یا میان‌بر انتخاب می‌شود و موجودی ندارد (BIZ-SRV-01 تا 05).
- **پول** Decimal و یک‌واحدی است؛ هیچ تبدیل ریال/تومان انجام نمی‌شود (BIZ-MNY-01).
- سفارش ۳.۰: دو شیوه دریافت «تحویل از فروشگاه» و «ارسال به نشانی»؛ پیش‌سفارش نوع سفارش است؛ فیش کارت‌به‌کارت سفارش را «در انتظار بررسی پرداخت» می‌کند؛ عضویت در فروشگاه جدا از مشتری ثبت‌شده توسط فروشنده؛ سفارش خدماتی پرینت با فایل و قیمت‌گذاری دوحالته (BIZ-MBR، BIZ-ORD-10 تا 15، BIZ-PRN).

---

## اعتبارسنجی موبایل و ورودی عددی — بازنگری 2.4.1، 2026-09-26

ورود همچنان فقط با موبایل و OTP است؛ شاهکار و کد ملی به آن اضافه نمی‌شود. قواعد این بخش برای فرم‌های ورود فروشنده و مشتری در موبایل/دسکتاپ یکسان است.

| ورودی | قرارداد قطعی |
|---|---|
| موبایل ایران | مقدار نهایی رشته‌ای ۱۱ رقمی، با شروع `09`؛ پس از نرمال‌سازی ارقام، الگوی `^09[0-9]{9}$` |
| OTP | رشته دقیقاً ۶ رقمی با الگوی `^[0-9]{6}$`؛ صفر ابتدای `012345` حفظ شود |
| عدد صحیح | فقط رقم؛ min/max و مثبت‌بودن بسته به فیلد؛ موبایل و OTP به Number تبدیل نشوند |
| مقدار اعشاری / پول | قرارداد مستقل Decimal/Money؛ قانون عدد صحیح نباید فروش کیلویی و مقدار کسری را از کار بیندازد |

اعداد فارسی `۰۱۲۳۴۵۶۷۸۹` و عربی `٠١٢٣٤٥٦٧٨٩` به `0123456789` نرمال شوند. تایپ، Paste، autofill و ورودی موبایل همه از همان تابع کنترل عبور کنند؛ محدودسازی keydown به‌تنهایی کافی نیست. حروف، علامت منفی/مثبت، اعشار، نماد علمی مانند `1e5` و متن مختلط به‌عنوان عدد پذیرفته نشوند؛ حروف را حذف نکنید تا یک ورودی غلط به شماره یا کد دیگری تبدیل شود. انتخاب متن، پاک‌کردن، کلیدهای حرکت، Tab و میانبرهای Paste مجازند.

در فیلد موبایل، Paste یک شماره کامل با پیش‌شماره ایران `+98` یا `0098` و فاصله/خط تیره متعارف، قبل از اعتبارسنجی به فرم `09…` تبدیل شود؛ سایر کدهای کشور رد شوند. مقدار UI و payload این فلو در قالب محلی `09…` و با ارقام ASCII به API می‌رود. ورودی بلند بی‌صدا کوتاه نشود. در OTP فقط trim فضای ابتدا/انتها مجاز است؛ متن مخلوط، جداکننده داخلی و بیشتر از ۶ رقم رد شوند. SMS autofill کد استخراج‌شده را تحویل همین validator بدهد.

### زمان و اثر خطا

- فرم دست‌نخورده خطای قرمز ندارد. از اولین تغییر، اعتبارسنجی فرانت در همان رویداد input/change انجام شود؛ منتظر submit، blur یا پاسخ سرور نماند. شماره یا کد ناقصِ ویرایش‌شده هم نامعتبر است.
- هنگام اصلاح به مقدار معتبر، خطای قالب فوراً پاک شود. دکمه «دریافت کد ورود» فقط با موبایل معتبر و دکمه «تأیید و ورود» فقط با کد ۶ رقمی معتبر فعال شود. اعتبار قالب OTP به معنی درست‌بودن کد نیست؛ تطبیق کد و انقضا در سرور است.
- مقدار نامعتبر هیچ درخواست ارسال/تأیید OTP نسازد. خطای قالب از شکست سرویس پیامک یا کد نادرست سرور تفکیک شود. تلاش برای درج کاراکتر غیرعددی رد و پیام «فقط رقم وارد کنید» نمایش داده شود؛ مقدار پذیرفته‌شده قبلی حفظ شود و با ویرایش معتبر بعدی خطا پاک گردد.
- سرور همین قالب را مستقل دوباره اعتبارسنجی کند؛ فرانت جایگزین اعتبارسنجی API و محدودیت تلاش نیست.

### متن و ظاهر خطا

| حالت | پیام |
|---|---|
| موبایل خالی بعد از ویرایش | شماره موبایل را وارد کنید. |
| موبایل با طول/پیش‌شماره غلط | شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود. |
| کاراکتر غیرعددی | فقط رقم وارد کنید. |
| OTP ناقص | کد ورود باید دقیقاً ۶ رقم باشد. |
| OTP صحیح از نظر قالب ولی ردشده سرور | کد واردشده درست نیست. دوباره تلاش کنید. |

خطای فیلد: حاشیه قرمز و متن Danger در کنار همان فیلد. خطای فرم/سرویس: `Alert / Type=Danger` با زمینه قرمز روشن، متن/حاشیه قرمز و آیکون هشدار. استفاده از رنگ سبز، Success یا رنگ برند برای قاب خطای اعتبارسنجی ممنوع است؛ رنگ برند روی دکمه «اصلاح» مجاز و معنای موفقیت ندارد. رنگ به‌تنهایی پیام خطا نیست. در فرانت `aria-invalid` و ارتباط خطا با `aria-describedby` و اعلان مناسب خوانشگر لحاظ شود؛ از اعلان مکرر و آزاردهنده هر رقم جلوگیری شود.

### کامپوننت‌های مشترک

در صفحه `03 — Product Entry Components` خانواده `Numeric Field` با `Kind=MobileIR | OTP | Integer` و `State=Empty | Filled | Focused | Error | Disabled` ساخته شد: ۱۵ واریانت. API نمایشی آن `Label`، `Value` و `Message` است؛ مثال‌های هر نوع در کنار خانواده آمده‌اند. ورودی‌های ورود و حالات خطای آن‌ها از instance این خانواده استفاده می‌کنند.

نگاشت پیاده‌سازی پیشنهادی: `IranMobileField`، `OtpField` و `IntegerField` روی یک زیرساخت مشترک DigitInput. موبایل `type="tel"`، `inputMode="numeric"`، `autoComplete="tel-national"`؛ OTP `type="text"`، `inputMode="numeric"`، `autoComplete="one-time-code"` و محدودیت منطقی ۶ رقم. `inputMode` فقط پیشنهاد صفحه‌کلید است، نه validator. از `type="number"` برای موبایل/OTP استفاده نشود. برچسب فارسی RTL و مقدار عددی در ناحیه LTR مستقل قرار گیرد. کنترل Paste شماره بین‌المللی قبل از محدودکردن طول انجام شود تا `+98` نیمه‌کاره بریده نشود.

صفحه‌های جدید نمونه حالت‌اند؛ فیگما کد اعتبارسنجی JavaScript یا ارسال پیامک واقعی اجرا نمی‌کند. رفتار لحظه‌ای تایپ باید طبق همین قرارداد در فرانت پیاده‌سازی شود.

### معیار پذیرش و مثال‌های ضروری

| ورودی / عمل | نتیجه |
|---|---|
| `09123456789`، `۰۹۱۲۳۴۵۶۷۸۹`، `٠٩١٢٣٤٥٦٧٨٩` | معتبر؛ خروجی واحد `09123456789` |
| Paste `+98 912 345 6789` یا `00989123456789` | تبدیل به `09123456789` و سپس اعتبارسنجی |
| `08123456789`، ۱۰ رقم، ۱۲ رقم، شماره ثابت | خطای فوری؛ بدون درخواست شبکه |
| Paste `0912abc456789` یا کشور دیگر | رد؛ بدون حذف حروف یا کوتاه‌کردن و تبدیل به شماره دیگر |
| OTP `012345` و `۰۱۲۳۴۵` | قالب معتبر؛ صفر اول حفظ شود؛ درستی کد با سرور |
| OTP `123`، `1234567`، `12a345`، `1e5`، `-12345` | نامعتبر؛ بدون درخواست تأیید |
| اصلاح شماره `08…` به `09…` با طول صحیح | پاک‌شدن فوری خطا و فعال‌شدن ارسال |
| فرم خالی دست‌نخورده | بدون پیام قرمز؛ اقدام اصلی غیرفعال |
| خطای قالب یا رد کد توسط سرور | Field Error / Alert Danger؛ بدون قاب سبز یا Success |
| مقدار کالای وزنی `1.5` | در DecimalQuantityField طبق قرارداد مقدار کسری مجاز؛ IntegerField جایگزین آن نشود |


---


## مبنای بصری موجود

فونت مرجع IRANSansX با fallback مناسب؛ عنوان قدیمی Vazirmatn تصمیم جاری نیست. حالت‌های معنایی Shop Light، Customer Light و Admin Light حفظ شوند. رنگ غالب فروشنده Teal/Green، مشتری Indigo/Violet و ادمین Slate/Neutral است. تعداد۹۰ متغیر در سند قبلی یک موجودی تاریخی است؛ طراح باید متغیرهای موجود را استفاده و کمبود واقعی را اضافه کند، نه برای رسیدن به عدد خاص متغیر بسازد. پیشوند کد --dukani-* و token معنایی مبناست. این بسته رنگ یا کتابخانه جدیدی را جایگزین کار موجود نمی‌کند.

## مقیاس و چیدمان

موبایل مرجع۳۹۰×۸۴۴ و دسکتاپ۱۴۴۰×۱۰۲۴؛ عرض‌های میانی و صفحه کوتاه باید بدون پنهان‌شدن اقدام اصلی پاسخ دهند. اندازه‌ها مرجع طراحی‌اند، نه الزام دستگاه. دسکتاپ sidebar و جدول و detail panel؛ موبایل فهرست فشرده و پنل/صفحه جزئیات. فروش سریع دسکتاپ نتایج و سبد را همزمان نشان دهد؛ موبایل جست‌وجو و خلاصه سبد ثابت با دسترسی سریع به اقلام داشته باشد. جدول چندردیفی نباید صرفاً کوچک شود تا در موبایل جا بگیرد؛ هر ردیف قابل بازکردن و اصلاح باشد.

نوار پایین خانه، کالاها، مشتریان، گزارش‌ها، بیشتر در صفحه‌های اصلی فروشنده باقی بماند. منوی بیشتر و sidebar مقصد مستقل موجودی‌ها، کاتالوگ و دسته‌بندی‌ها و تنظیمات دارد. میان‌بر فروش و ثبت کالا همیشه در دسترس است. اسکنر تمام‌صفحه استثناست و خروج آشکار دارد. نوار اقدام فرم بالای safe-area و صفحه‌کلید قرار بگیرد و فیلد فعال را نپوشاند.

## Componentها

| خانواده | نیاز |
|---|---|
| پایه | Button با وضعیت‌ها، Input با label پایدار، Number/Money/Phone input، Checkbox، Radio، Tabs، Badge، Dialog، Toast |
| انتخاب | SearchBox، Combobox با ساخت درجا، EntityPicker، CategoryPicker، BrandPicker، DateRangePicker |
| کالا و خدمت | ProductResult با تفاوت مدل/رنگ/واحد، ItemKindBadge (کالا/خدمت)، BarcodeInput، ShortcutSearch، CameraPermission، ScannerOverlay، UnitSelector |
| ورود | ReceiptRow، InlineError، CostStatus، OptionalDetails، BatchPreview، DuplicateComparison |
| فروش | CartRow، QuantityControl، DiscountControl، PaymentMethod، PaymentAmount، CustomerPicker، InvoiceSummary |
| مشتری | CustomerRow با موبایل/مانده، DebtRow، LedgerEntry، AllocationEditor، SMSStatus |
| گزارش | MetricCard، ComparisonCard با مبنا، ChartLegend، FilterChips، CoverageBanner، LowStockRow، DataIssueRow |
| آینده | ExpenseForm، PaymentDocument، CheckTimeline، ReconciliationRow، AccountPicker، OrderTimeline، DepositSummary، PaymentStatusBadge، PrintSpecForm، FileUploadList، QuoteReview |

## قرارداد حالت

هر component در حالت عادی، focus، disabled و خطای مربوط بررسی شود. صفحه‌های داده loading، empty، error، offline و partial داشته باشند. pending مالی با success متفاوت است. تعارض نیازمند متن تفاوت و اقدام اصلاح است. banner نقص بها روی همان گزارش باقی می‌ماند؛ toast گذرا کافی نیست. خطای فیلد کنار همان فیلد، خطای کلی با اقدام بازیابی مشخص.

## پول، مقدار و تاریخ

واحد مبلغ همیشه کنار مقدار یا عنوان ستون؛ قیمت واحد و مبلغ کل ستون جدا. واحد «بسته۲۰تایی» با «عدد» فقط به رنگ یا icon متمایز نشود. اعداد قابل مقایسه تراز ثابت داشته باشند؛ موبایل، کد بارکد و شماره حساب در قطعه LTR مستقل از RTL قرار بگیرند. در ورود کاربر ارقام فارسی/عربی/لاتین پذیرفته شوند. مقدار صفر، نامعلوم و خطا سه نمایش مستقل‌اند. تاریخ اختیاری تولید/انقضا جای تاریخ خرید را نمی‌گیرد.

## متن و تراکم

هر صفحه یک اقدام اصلی متناسب با هدف دارد؛ در موفقیت ثبت کالا «ثبت کالای بعدی»، در موفقیت فروش «فروش بعدی». عبارت فنی StoreProduct، ledger، override، idempotency، نسخه‌سازی و تصمیم معماری داخل UI روزمره نشان داده نشود. توضیح تنها وقتی لازم است که تصمیم را روشن کند؛ مانند اثر بهای نامعلوم یا تبدیل بسته به عدد. annotation و دلیل طراحی بیرون فریم یا در سند handoff بماند. دکمه‌هایی مثل «حالت پرداخت کامل نمونه» برای نمایش همه سناریوها داخل UI واقعی قرار نگیرند.

## دسترس‌پذیری و آزمون بصری

کنترل‌ها با صفحه‌کلید قابل استفاده، focus قابل رؤیت و label قابل خواندن داشته باشند. فقط رنگ برای افزایش/کاهش، بدهی یا خطا کافی نیست. لمس روی دکمه‌های مقدار با فاصله مناسب از حذف؛ هدف لمسی پیشنهادی۴۴px. حالت حرکت کاهش‌یافته، متن طولانی، نام مشتری خالی، بزرگ‌نمایی، ارقام بزرگ، صفحه‌کلید باز و هر دو جهت RTL/LTR بررسی شوند. خوانشگر باید تغییر جمع سبد و خطای فیلد را اعلام کند بدون اعلام تکراری هر frame اسکن.

## حفظ جزئیات پیشین

مقادیر اولیه palette، spacing، radius، typography و الگوهای component از بخش مرجع در ادامه حفظ شده‌اند. در تعارض فونت/تجربه/دامنه نسخه، بخش‌های جاری بالاتر و final-decisions.md حاکم‌اند؛ اعداد style پیشنهادی با فایل موجود تطبیق داده می‌شوند، نه به‌صورت بازطراحی اجباری.


## پیوست مقادیر و الگوهای بصری مبنا

این بخش جزئیات طراحی منبع را حفظ می‌کند؛ مرجع تعهد نسخه‌ها جدول انتشار جاری است.

## 7. قرارداد Tokenها

Tokenها سه سطح دارند:

```text
Reference Token → Semantic Token → Component Token
```

نمونه:

```text
teal.700
  → color.action.primary
    → button.primary.background
```

Feature فقط Semantic یا Component token می‌بیند.

### 7.1 قواعد نام‌گذاری

```text
--dukani-color-bg-canvas
--dukani-color-bg-surface
--dukani-color-text-primary
--dukani-color-text-secondary
--dukani-color-border-default
--dukani-color-action-primary
--dukani-color-status-success
--dukani-space-control-inline
--dukani-radius-control
--dukani-shadow-overlay
```

نام Token نباید به رنگ واقعی مانند `green-button` وابسته باشد.

---


## 8. رنگ

### 8.1 پالت پایه موقت

این مقادیر برای شروع توسعه‌اند و Designer می‌تواند بدون تغییر Feature آن‌ها را عوض کند.

| نقش | مقدار پایه | مصرف |
|---|---|---|
| Primary 700 | `#0F766E` | CTA و Focus فعال |
| Primary 800 | `#115E59` | Hover/Pressed |
| Primary 50 | `#F0FDFA` | Selected surface |
| Accent 500 | `#F59E0B` | Highlight محدود، نه متن روی سفید |
| Success 700 | `#15803D` | موفقیت قطعی |
| Warning 700 | `#B45309` | هشدار قابل اقدام |
| Danger 700 | `#B91C1C` | خطا و Action مخرب |
| Info 700 | `#1D4ED8` | اطلاعات و وضعیت در حال بررسی |
| Neutral 950 | `#0F172A` | متن اصلی |
| Neutral 600 | `#475569` | متن ثانویه |
| Neutral 200 | `#E2E8F0` | Border |
| Neutral 50 | `#F8FAFC` | Canvas |
| White | `#FFFFFF` | Surface |

### 8.2 معنا ثابت است

- سبز فقط برای موفقیت یا وضعیت سالم استفاده می‌شود.
- قرمز فقط خطا، خطر یا Action مخرب است.
- نارنجی هشدار است، نه موفقیت.
- آبی/Teal Action و اطلاعات است.
- وضعیت فقط با رنگ منتقل نمی‌شود؛ Icon و Text نیز لازم‌اند.

### 8.3 Contrast

- متن عادی حداقل معیار AA را پاس می‌کند.
- Placeholder جای Label نیست.
- Disabled باید قابل تشخیص باشد ولی اطلاعاتش ناخوانا نشود.
- متن روی Accent زرد بدون بررسی Contrast استفاده نمی‌شود.

### 8.4 Theme

- Light theme در `v1.0` تحویل می‌شود.
- Tokenها از ابتدا Theme-ready هستند.
- Dark theme تا وجود نیاز واقعی Release نمی‌شود.
- High contrast ترجیح کاربر باید در Componentهای کلیدی قابل پشتیبانی باشد.

---


## 9. تایپوگرافی

### 9.1 Font

| Locale | Font پیشنهادی | Fallback |
|---|---|---|
| `fa` | IRANSansX self-hosted | system sans-serif |
| `en` | Inter self-hosted | system sans-serif |

License فایل Font پیش از Bundle بررسی می‌شود. Font با `next/font/local` یا Adapter معادل Self-host می‌شود.

تصمیم نهایی: Family اصلی فارسی `IRANSansX` است. اگر نام داخلی فایل Font تفاوت داشت، نام فنی دقیق در token و `next/font/local` ثبت می‌شود؛ تغییر Family بدون ADR و بررسی License/Metric مجاز نیست.

### 9.2 Type Scale

| Token | اندازه/Line height | مصرف |
|---|---|---|
| `text-xs` | `12/18` | Caption و Meta |
| `text-sm` | `14/22` | متن ثانویه و Table |
| `text-md` | `16/26` | متن و Input اصلی |
| `text-lg` | `18/28` | Card title |
| `text-xl` | `20/30` | Section title |
| `text-2xl` | `24/36` | Page title |
| `text-3xl` | `32/44` | Marketing heading |

### 9.3 وزن

- Regular برای متن بدنه
- Medium برای Label و Control
- SemiBold برای Heading و مبلغ نهایی
- Bold فقط برای تأکید محدود

### 9.4 عدد

- ستون‌های عددی Alignment ثابت دارند.
- رقم فارسی/لاتین بر اساس Locale نمایش داده می‌شود.
- مبلغ و تعداد از Font feature مناسب اعداد جدولی در صورت پشتیبانی استفاده می‌کنند.
- واحد پول کنار عدد گم نمی‌شود.

---


## 10. فاصله و Grid

مبنای فاصله `4px` است:

| Token | مقدار |
|---|---:|
| `space-0` | 0 |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |

قواعد:

- Padding صفحه موبایل معمولاً 16px است.
- فاصله Sectionها معمولاً 24 یا 32px است.
- فاصله Label تا Control بین 6 تا 8px است.
- فاصله Touch targetهای مجاور به‌اندازه کافی از خطای لمس جلوگیری می‌کند.
- مقدار Arbitrary فقط با دلیل Design ثبت‌شده مجاز است.

---


## 11. Radius، Border و Shadow

| Token | مقدار پایه | مصرف |
|---|---:|---|
| `radius-sm` | 6px | Badge/compact |
| `radius-md` | 10px | Input/Button |
| `radius-lg` | 14px | Card |
| `radius-xl` | 20px | Sheet/Dialog بزرگ |
| `radius-full` | 9999px | Avatar/Pill |

قواعد:

- Radius Featureها از Token می‌آید.
- Border پیش‌فرض 1px و Neutral است.
- Shadow برای جداسازی Overlay و Floating action استفاده می‌شود، نه همه Cardها.
- Card عملیاتی ترجیحاً با Border و Background از Canvas جدا می‌شود.

---


## 12. Responsive و Breakpoint

Breakpointها براساس رفتار Layout هستند، نه مدل دستگاه:

| نام مفهومی | بازه پایه | رفتار |
|---|---:|---|
| Compact | `< 640px` | یک ستون، Bottom navigation |
| Medium | `640–1023px` | دو پنل محدود، Navigation تطبیقی |
| Wide | `≥ 1024px` | Sidebar و Detail panel |

قواعد:

- Feature با Container width تصمیم می‌گیرد، نه فقط Viewport.
- هیچ جریان اصلی روی Compact اسکرول افقی اجباری ندارد.
- Spreadsheet استثناست و Scroll کنترل‌شده با ستون ثابت دارد.
- Modal بزرگ روی Compact به Full-screen Sheet تبدیل می‌شود.
- Action اصلی نزدیک پایین صفحه و دسترس انگشت قرار می‌گیرد.
- `safe-area-inset-*` در PWA و Mobile action bar رعایت می‌شود.

---


## 13. Layout Shell

### 13.1 Seller Mobile

- Top app bar: عنوان Context، فروشگاه و Action ثانویه
- Content: Scroll مستقل صفحه
- Bottom navigation: حداکثر ۵ مقصد اصلی
- Floating/Sticky primary action فقط در صورت نیاز

پیشنهاد Navigation اولیه:

1. خانه
2. فروش
3. کالاها
4. خرید
5. بیشتر

### 13.2 Seller Desktop

- Sidebar قابل جمع‌شدن
- Header کم‌ارتفاع
- Content max-width متناسب با Screen
- Detail drawer یا Split view برای Tableها

### 13.3 Buyer

- Navigation ساده‌تر از Seller
- Search و Cart دسترسی بالا
- فروشگاه و وضعیت سفارش همیشه قابل تشخیص

### 13.4 Public

- کمترین Chrome اپلیکیشن
- CTA روشن برای ورود یا سفارش
- Metadata و Share preview مناسب

---


## 14. RTL و LTR

- `dir` در ریشه Document از Locale می‌آید.
- CSS logical properties اجباری‌اند.
- `margin-left/right` برای Layout عمومی ممنوع است؛ از `margin-inline-*` استفاده می‌شود.
- Alignment متن فارسی `start` است، نه Hard-coded `right`.
- Back/forward، Chevron و Step direction با Locale Mirror می‌شوند.
- Search، Camera، Barcode و Play icon Mirror نمی‌شوند.
- ترکیب شماره فاکتور، موبایل، URL و مبلغ با `bdi` یا isolation مناسب نمایش داده می‌شود.
- جدول عددی باید در هر دو جهت Alignment ثابت و قابل فهم داشته باشد.
- Drag handle و Swipe action در هر دو جهت تست می‌شوند.

---


## 15. Iconography

قواعد:

- یک Icon set اصلی پشت UI Facade استفاده می‌شود.
- Stroke و اندازه در یک Surface ثابت‌اند.
- اندازه رایج 20 و 24px است.
- Icon-only button حتماً Accessible name و Tooltip مناسب دارد.
- Action مخرب با Icon سطل به‌تنهایی کافی نیست؛ Label یا Confirmation لازم است.
- Icon وضعیت با رنگ و متن همراه است.
- Emoji جای Icon عملیاتی استاندارد را نمی‌گیرد.

---


## 16. Motion

Motion باید تغییر State را توضیح دهد:

| مورد | مدت پایه |
|---|---:|
| Hover/press | 100–150ms |
| Expand/collapse | 180–240ms |
| Sheet/Dialog | 200–300ms |
| Page transition محدود | 200–300ms |

قواعد:

- Animation فروش را کند نمی‌کند.
- Success مالی با Motion نمایشی طولانی همراه نیست.
- Loading با Spinner بی‌پایان بدون متن رها نمی‌شود.
- `prefers-reduced-motion` رعایت می‌شود.
- Motion زمان واقعی عملیات Server را پنهان نمی‌کند.

---


## 17. Touch، Pointer و Keyboard

- Touch target هدف داخلی دکانی حداقل `44×44px` است.
- فاصله Targetهای کوچک جلوی لمس اشتباه را می‌گیرد.
- Gesture تنها مسیر Action نیست.
- Drag & Drop جایگزین Button/Menu دارد.
- Hover تنها راه مشاهده اطلاعات نیست.
- تمام Actionهای اصلی با Keyboard قابل انجام‌اند.
- Focus ring واضح است و با Brand color Contrast کافی دارد.
- Sticky bar نباید Focus را بپوشاند.

---


## 18. Button

### 18.1 Variantها

| Variant | مصرف |
|---|---|
| Primary | Action اصلی Screen |
| Secondary | Action مهم دوم |
| Tertiary/Ghost | Action کم‌تأکید |
| Danger | Action مخرب |
| Link | Navigation در متن |

### 18.2 اندازه

| Size | Height | مصرف |
|---|---:|---|
| Compact | 36px | Table desktop، نه Action اصلی موبایل |
| Default | 44px | حالت عمومی |
| Large | 48px | CTA موبایل و Checkout |

### 18.3 Stateها

- Default
- Hover
- Focus visible
- Pressed
- Loading
- Disabled
- Success موقت فقط در صورت نیاز

Loading عرض Button را تغییر نمی‌دهد و Label معنا را حفظ می‌کند. Disabled بدون توضیح در Actionهای مهم استفاده نمی‌شود.

---


## 19. Input و Form Control

Anatomy:

```text
Label
Optional/required indicator
Control
Hint or unit
Error / success message
```

قواعد:

- Label دائمی است؛ Placeholder مثال است.
- Required با متن یا علامت دارای توضیح مشخص می‌شود.
- Error زیر Field و در Summary فرم نمایش داده می‌شود.
- Input mobile keyboard متناسب (`numeric`, `tel`, `decimal`) دارد.
- Clear button در Search و Fieldهای مناسب وجود دارد.
- Prefix/Suffix نباید متن واردشده را بپوشاند.
- Read-only با Disabled یکسان نمایش داده نمی‌شود.
- Autofill و Password manager بی‌دلیل غیرفعال نمی‌شوند.

---


## 20. Number، Quantity و Money Field

### 20.1 Number Field

- رقم فارسی، عربی و لاتین را می‌پذیرد.
- مقدار canonical را به Form تحویل می‌دهد.
- Min/Max و Step قابل تعریف‌اند.
- برای تعداد، Stepper در کنار ورود مستقیم قابل استفاده است.

### 20.2 Money Field

- واحد نمایش همیشه قابل مشاهده است.
- جداکننده هزارگان هنگام تایپ تجربه را خراب نمی‌کند.
- مبلغ Decimal و یک‌واحدی است؛ هیچ تبدیل ریال/تومان انجام نمی‌شود (BIZ-MNY-01). برچسب واحد («تومان») فقط در نمایش و از تنظیم سراسری می‌آید.
- مقدار خام و مقدار نمایش از هم جدا هستند.
- مبلغ منفی فقط در Context مجاز پذیرفته می‌شود.
- رقم گرد‌شده با توضیح قاعده نمایش داده می‌شود.

### 20.3 Summary

در فاکتور:

1. جمع اقلام
2. تخفیف
3. مالیات در صورت کاربرد
4. هزینه ارسال
5. مبلغ پرداخت‌شده
6. مانده/نسیه
7. مبلغ نهایی با تأکید بیشتر

---


## 21. Date و Time

- `DateField` Locale و Calendar را مدیریت می‌کند.
- فارسی به‌صورت پیش‌فرض تقویم فارسی و انگلیسی Gregorian است.
- مقدار ذخیره Date-only یا UTC instant است.
- کاربر می‌تواند تایپ یا Picker استفاده کند.
- تاریخ نامعتبر هنگام Blur و Submit روشن می‌شود.
- سررسید نسیه Relative hint مانند «۳ روز دیگر» دارد.
- Time slot و Date از هم قابل تشخیص‌اند.

---


## 22. Select، Combobox و Entity Picker

| Component | مصرف |
|---|---|
| Select | گزینه محدود و از قبل بارگذاری‌شده |
| Combobox | گزینه زیاد یا Search لازم |
| MultiSelect | چند انتخاب محدود |
| EntityPicker | محصول، مشتری، تأمین‌کننده با Detail |

قواعد:

- روی موبایل لیست بلند به Bottom sheet تبدیل می‌شود.
- Search term پس از Back بدون دلیل از دست نمی‌رود.
- Empty result امکان ساخت سریع Entity را در Context مناسب می‌دهد.
- چند نتیجه مشابه تفاوت کلیدی را نشان می‌دهد.
- نتیجه انتخاب‌شده فقط با رنگ مشخص نمی‌شود.

---


## 23. Search

- Search در Listهای اصلی در دسترس و Sticky محدود است.
- Clear و Cancel رفتار روشن دارند.
- Debounce فقط Search API را کنترل می‌کند؛ تایپ فوراً دیده می‌شود.
- Recent query فقط در صورت ارزش و رعایت Privacy ذخیره می‌شود.
- نتیجه بر اساس عنوان، بارکد، SKU، برند و دسته Label مناسب دارد.
- Highlight نتیجه نباید Screen reader را مخدوش کند.

---


## 24. Barcode UI

Componentهای مورد نیاز:

- `BarcodeScanButton`
- `BarcodeScannerSheet`
- `BarcodeResultCard`
- `BarcodeConflictPicker`
- `ManualBarcodeInput`
- `CameraPermissionState`

Stateها:

1. آماده اسکن
2. درخواست Permission
3. در حال اسکن
4. یافت‌شده در فروشگاه
5. پیشنهاد کاتالوگ سراسری
6. چند نتیجه مشابه
7. ناشناخته
8. تعارض
9. دوربین در دسترس نیست

قواعد:

- بارکد شرط ثبت یا فروش نیست؛ کالا و خدمت بدون بارکد با نام، SKU یا میان‌بر پیدا می‌شوند (BIZ-SRV-03).
- اسکن موفق Feedback صوتی/لرزش اختیاری و بصری دارد.
- Feedback نباید تنها صوتی باشد.
- قیمت و مشخصات پیشنهادی از اطلاعات قطعی فروشگاه جدا نمایش داده می‌شوند.
- ورود دستی همیشه ممکن است.
- Scanner تمام‌صفحه راه خروج واضح دارد.

---


## 25. Table، Data List و Spreadsheet

### 25.1 انتخاب Pattern

| نیاز | Pattern |
|---|---|
| مشاهده ساده موبایل | Card/Data list |
| مقایسه چند ستون | Responsive table |
| عملیات گروهی دسکتاپ | Data grid |
| ورود چندردیفی | Spreadsheet grid |

### 25.2 Table

- Header قابل تشخیص و Sticky در صورت نیاز
- Sort state با Icon و Accessible label
- Numeric alignment ثابت
- Row action با Menu قابل دسترسی
- Selection count و Bulk action bar
- Empty/Loading/Error داخل Context جدول

### 25.3 Mobile adaptation

- ستون‌های کم‌اهمیت پنهان یا وارد Detail می‌شوند.
- Action اصلی Row مستقیماً قابل دسترس است.
- Card list جای Table را می‌گیرد، مگر مقایسه ستونی ضروری باشد.

### 25.4 Spreadsheet ورود کالا

- Paste چندسلولی
- Row number
- Validation در Cell و Row summary
- ستون ثابت عنوان
- Keyboard navigation روی Desktop
- Touch edit mode روی Mobile
- Preview قبل از Commit
- تعداد Success/Warning/Error ثابت و قابل مشاهده
- Undo تغییر محلی قبل از ثبت
- Import هرگز بدون تأیید اثر موجودی ایجاد نمی‌کند.

---

## معیار تکمیلی۲.۲

از Button، TextField، AppBar، ProductDataRow، PaymentMethodRow، MetricCard و BottomNavigation همان صفحه کامپوننت instance ساخته شود. فاصله/رنگ/تایپوگرافی به توکن موجود متصل بماند. فرم طولانی اسکرول، اقدام ثابت و فضای کیبورد دارد. انتخاب مشتری از سبد جدا نیست؛ برگشت از ثبت سریع همان سبد را حفظ می‌کند. ثبت کالای بعدی اقدام اصلی موفقیت ثبت کالا و فروش بعدی اقدام اصلی فاکتور است.

فلوهای بارکد B00/B01/B02، تولید/انقضا/قیمت تولیدکننده در ورود موجودی، فهرست موجودی مستقل و منوی کاتالوگ/نوع کالا الزامی‌اند. اجزای آینده در منوی MVP فعال نشوند. وضعیت خطا، مجوز، آفلاین، نتیجه نامعلوم و بازگشت طبق page-contracts.md اجرا شود.
