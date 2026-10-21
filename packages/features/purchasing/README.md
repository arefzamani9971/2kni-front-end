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

## سازمان‌دهی UI — نقشهٔ مالکیت (2026-10-20)

وضعیت: نقشه ثبت شده؛ گام‌های ۱ تا ۵ از ترتیب اجرای زیر انجام شده‌اند و بقیهٔ فایل‌ها هنوز در مسیر قبلی‌اند. مبنا گراف واقعی import در `src/ui` است (۸۹ فایل) و برای هر فایل، مصرف‌کننده‌هایش بررسی شده‌اند. API عمومی `src/index.ts` و نام فایل‌ها ثابت می‌مانند.

**پیشنهاد: sectioned با دو بخش و common.** دو جریان مستقل با مدل وضعیت متفاوت وجود دارد:

- **`receipts`** (F17–F21، F71): فهرست، رسید چندقلمی با پیش‌نویس سروری و `expectedVersion`، جمع و ثبت نهایی، ضمیمه و جزئیات.
- **`quick-receipt`** (F13): رسید تک‌کالا با پیش‌نویس محلی منجمد و operation id، شامل خرید پیوسته و موجودی اولیه.

امروز هر دو جریان در `components` و `hooks` مخلوط‌اند؛ مثلاً `ReceiptForm` مال F13 است و `LineEditor` مال رسید چندقلمی. خرید پیوسته و موجودی اولیه یک بخش‌اند، چون ۱۹ فایل فرم، نتیجه، فرمان و پیش‌نویس محلی را مشترک دارند؛ جداکردن آن‌ها common را متورم می‌کرد.

| مقصد                                           | فایل‌ها                                                                                                                                                                                                                                                                                                                                          | مسئولیت و مصرف                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `receipts/screens`                             | PurchasesScreen، NewPurchaseScreen، PurchaseLinesScreen، PurchaseTotalsScreen، PurchaseAttachmentScreen، PurchaseDetailScreen                                                                                                                                                                                                                    | صفحه‌های رسید؛ مصرف فقط از `index.ts`                                                              |
| `receipts/components`                          | LineEditor، LineSheet، LineSummary، LineZeroCostReason، ProductPicker، Totals، TotalsFields                                                                                                                                                                                                                                                      | ویرایش قلم، انتخاب کالا، جمع و ثبت نهایی                                                           |
| `receipts/hooks`                               | use-purchase، use-purchase-list، use-purchase-lines، use-save-draft، use-purchase-attachments، use-purchase-totals، use-totals-form، use-finalize-purchase، use-product-search                                                                                                                                                                   | دادهٔ رسید و فرمان‌های آن؛ `use-purchase` فقط در همین بخش مصرف می‌شود                              |
| `receipts/schemas` و `types`                   | LineEditor.schema، purchase-totals.schema؛ LineEditor.types، purchase-totals.types، use-purchase-lines.types، use-purchase-attachments.types                                                                                                                                                                                                     | فایل‌های همراه                                                                                     |
| `receipts/tests`                               | line-editor.test، LineEditor.schema.test، purchase-editing.test، totals-form.test، use-finalize-purchase.test                                                                                                                                                                                                                                    |                                                                                                    |
| `quick-receipt/screens`                        | ContinuousPurchaseScreen، OpeningPickScreen، OpeningQueueScreen                                                                                                                                                                                                                                                                                  | مصرف فقط از `index.ts`                                                                             |
| `quick-receipt/components`                     | ReceiptForm، ReceiptHeaderFields، ReceiptLineFields، ReceiptSummary، ReceiptUnitName، SalePriceField، UnknownCostNotice، ZeroCostReasonField، ReceiptOutcome، SalePriceOutcome، SelectedProductRow؛ ProductIdentification، ProductAutocomplete، DuplicateInvoiceDialog، RecordedReceiptBanner؛ OpeningPickGrid، OpeningQueuePanel، OpeningResult | فرم و نتیجهٔ مشترک دو جریان؛ سپس اجزای خرید پیوسته؛ سپس اجزای موجودی اولیه                         |
| `quick-receipt/hooks`                          | use-receipt-command، use-local-draft، use-sale-price-follow-up، use-continuous-purchase، use-product-identification، use-product-autocomplete، use-opening-pick، use-opening-queue                                                                                                                                                               | سه هوک اول بین خرید پیوسته و موجودی اولیه مشترک‌اند                                                |
| `quick-receipt/schemas`، `types` و `constants` | ReceiptForm.schema؛ ReceiptForm.types، ProductIdentification.types، use-receipt-command.types، use-local-draft.types، use-sale-price-follow-up.types؛ ContinuousPurchaseScreen.constants، OpeningQueueScreen.constants، use-product-autocomplete.constants                                                                                       | فایل‌های همراه                                                                                     |
| `quick-receipt/tests`                          | receipt-flows.test، use-product-autocomplete.test                                                                                                                                                                                                                                                                                                |                                                                                                    |
| `common/components`                            | PurchasingShell، SupplierField، SupplierCreateScene                                                                                                                                                                                                                                                                                              | پوستهٔ همهٔ صفحه‌ها؛ انتخاب و ساخت درجای تأمین‌کننده در NewPurchaseScreen و ReceiptHeaderFields    |
| `common/hooks`                                 | use-store-product، use-suppliers، use-create-supplier                                                                                                                                                                                                                                                                                            | `use-store-product` در LineSheet، NewPurchaseScreen، ContinuousPurchaseScreen و OpeningQueueScreen |
| `common/state`                                 | purchase-keys، supplier-keys                                                                                                                                                                                                                                                                                                                     | کلید کش؛ `purchaseKeys` بخشی از API عمومی است                                                      |
| `common/schemas`                               | SupplierCreate.schema                                                                                                                                                                                                                                                                                                                            |                                                                                                    |
| `i18n`                                         | catalogs، types، fa.json، en.json، use-purchase-translations                                                                                                                                                                                                                                                                                     | بدون تغییر                                                                                         |

موارد باز پیش از اجرا:

- `i18n/use-purchase-presentation.ts` در ۱۹ فایل از هر دو بخش مصرف می‌شود. با ثبت sectioned، i18n فقط کاتالوگ و اتصال مترجم را نگه می‌دارد. پیشنهاد، مانند product-entry، `common/hooks` است. این همان تصمیم باز مالک دربارهٔ قالب‌بندهای سطح فیچر است و پیش از ثبت نهایی تأیید می‌شود.
- `screens/PurchaseAttachmentScreen.types.ts` فقط `UploadState` را re-export می‌کند و هیچ فایلی آن را import نمی‌کند. حذف آن فقط با تأیید مالک انجام می‌شود.
- نام بخش‌ها (`receipts`، `quick-receipt`) پیشنهادی‌اند.

ترتیب اجرا: هر واحد انتقال مکانیکی یک گروه منسجم است، بدون تغییر منطق. purchasing تا واحد آخر در `tools/architecture/ui-organization.mjs` ثبت نمی‌شود، پس در طول مهاجرت استثنای موقت لازم نیست. ثبت نهایی هر import میان بخش‌ها را آشکار می‌کند.

1. `common`: PurchasingShell، purchase-keys، supplier-keys و use-store-product.
2. `common`: گروه تأمین‌کننده (SupplierField، SupplierCreateScene، schema و دو hook).
3. `quick-receipt`: خانوادهٔ ReceiptForm با فیلدها، خلاصه، schema و types.
4. `quick-receipt`: هوک‌های مشترک فرمان، پیش‌نویس محلی و پیگیری قیمت فروش، با نتیجه‌ها و ردیف کالای انتخاب‌شده.
5. `quick-receipt`: جریان خرید پیوسته.
6. `quick-receipt`: جریان موجودی اولیه و آزمون receipt-flows.
7. `receipts`: ویرایش قلم و ProductPicker.
8. `receipts`: جمع و ثبت نهایی.
9. `receipts`: صفحه‌ها و هوک‌های باقی‌مانده.
10. انتقال `use-purchase-presentation` پس از تأیید مالک.
11. ثبت purchasing در `ui-organization.mjs` و به‌روزرسانی این README.
