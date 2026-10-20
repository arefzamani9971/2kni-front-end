# Feature: purchasing — ثبت خرید و تأمین‌کنندگان

| | |
|---|---|
| Scope | `scope:seller` |
| Figma | purchaselist `358:546`، purchase `312:9194`، purchasetotals `358:547`، purchaseattachment `358:548`، purchasedetail `358:549` |
| جریان | F17–F21، F71 (رسید خرید با چند قلم، تخفیف و هزینهٔ اضافه، ضمیمه، فاکتور تکراری)؛ F13 (خرید پیوسته CPB-06، موجودی اولیهٔ گروهی CPB-04، انتخاب/ساخت درجای تأمین‌کننده) |
| Endpoints | `GET/POST …/purchases`، `GET/PUT/DELETE …/purchases/{id}`، `GET …/purchases/{id}/totals`، `POST …/purchases/{id}/finalize` ♻، `POST …/purchases/quick` ♻، `PUT …/purchases/{id}/attachments`، `GET/POST …/suppliers`، `GET …/products`، `POST …/products/search`، `GET …/barcodes/{code}`، `PUT …/products/{id}/pricing` (قیمت اختیاری پس از رسید)، `POST …/files` (BCR-13) |
| Figma (F13) | continuous 1255:79/80 (دسکتاپ)، 1255:159 (موبایل)؛ opening 1255:61–65 / 1255:141–145؛ supplierselect/new 594:6675/6694، 597:4078/4130 |

## مسیرها

| مسیر | صفحه |
|---|---|
| `~/purchases` | فهرست با فیلتر وضعیت؛ پیش‌نویس ← «ادامه ثبت» |
| `~/purchases/new[?productId=]` | کالا + «مقدار خرید» + «خلاصهٔ ورود» + تأمین‌کننده/فاکتور/تاریخ ← `POST` پیش‌نویس |
| `~/purchases/[id]/lines` | اقلام پیش‌نویس: افزودن، ویرایش، حذف (`PUT` کامل با `expectedVersion`) |
| `~/purchases/[id]/totals` | تخفیف، حمل، مالیات غیرقابل بازیافت، کنترل جمع فاکتور ← «ثبت نهایی خرید» |
| `~/purchases/[id]/attachment` | عکس یا PDF فاکتور |
| `~/purchases/[id]` | رسید نهایی |
| `~/purchases/continuous[?productId=]` | خرید پیوسته: هر «ثبت خرید» یک رسید مستقل (QuickReceive)، سپس همان فرم خالی |
| `~/purchases/opening` | انتخاب کالاهای بی‌گردش برای موجودی اولیه (DataGrid صفحه‌ای) |
| `~/purchases/opening/[queueId]` | صف موجودی اولیه: ثبت و بعدی، رد کردن، پایان و خلاصه (پیش‌نویس محلی) |

## قواعد

- پیش‌نویس از همان قلم اول روی سرور ساخته می‌شود؛ رفرش یا دستگاه دیگر رسید را از دست نمی‌دهد و فهرست «ادامه ثبت» نشان می‌دهد.
- هر تغییر پیش‌نویس `PUT` کامل با `expectedVersion` است؛ `VERSION_CONFLICT` به‌صورت خطای قابل فهم نمایش داده می‌شود.
- «ثبت نهایی خرید» یک `FinalCommand` است (یک شناسه عملیات، بازپخش پاسخ گم‌شده، بدون رکورد دوم).
- `PURCHASE_DUPLICATE_INVOICE` ← تأیید با دلیل (`confirmDuplicateInvoiceNo` + `duplicateReason`).
- بهای نامعلوم صفر نیست: قلم با `costStatus=Unknown` و بدون مبلغ ثبت می‌شود و هشدار می‌ماند.
- «جمع فاکتور تأمین‌کننده» فقط برای کنترل اختلاف است و ذخیره نمی‌شود.
- جمع‌های خرید: `useTotalsForm` و `TotalsFields` مالک ورودی/اعتبارسنجی‌اند؛ `useFinalizePurchase` مالک واحد زنجیرهٔ ذخیره ← نسخهٔ پاسخ ← ثبت نهایی است. `Totals` فقط ترکیب صفحه، تأیید و پیام/ناوبری را هماهنگ می‌کند.
- زنجیره از شروع ذخیره قفل هم‌زمانی دارد. نتیجهٔ نامعلوم فقط با همان بدنه/نسخه/کلید بازیابی می‌شود؛ نتیجهٔ قطعی موفق با شکست invalidation یا ناوبری دوباره ثبت نمی‌شود. پس از ذخیره و رد قطعی ثبت نهایی، نسخهٔ ذخیره‌شده برای اصلاح/تأیید بعدی حفظ می‌شود.
- نسخهٔ فرم بی‌صدا با refetch جایگزین نمی‌شود. تعارض نسخه یا پاسخ گم‌شدهٔ PUT باعث finalize نمی‌شود؛ بررسی دوبارهٔ رسید از سرور لازم است. این PUT دارای expectedVersion است و idempotency ثبت نهایی به آن تعمیم داده نمی‌شود.
- بارگذاری فایل پشت Port `FileUploader` است (BCR-13)؛ با انتشار endpoint در بک‌اند فقط Adapter تغییر می‌کند.
- فیلتر «اصلاح‌شده» تا وجود فیلتر اصلاح در API، رسیدهای نهایی را نشان می‌دهد.
- **رسید تک‌کالا (F13):**
  - هر نوبت یا قلم پیش از ارسال با operation id در پیش‌نویس محلی منجمد می‌شود (`purchase-continuous/current`، `opening-queue/{id}`).
  - پاسخ نامعلوم فقط با «بررسی دوباره» و همان کلید حل می‌شود؛ رد قطعی آن را آزاد می‌کند.
  - شناسایی (بارکد، دوربین، autocomplete) فقط کالا و واحد را تعیین می‌کند.
  - Opening تأمین‌کننده، فاکتور، هزینه و تاریخ ساختگی ندارد.
  - لایه‌ها: domain (`receipt`، `receipt-form`، `continuous-purchase`، `opening-queue`)، پورت‌های `application/receipt.ports.ts` و adapterهای `infrastructure/http-*`؛ UI فقط از ماژول استفاده می‌کند.
