# Feature: purchasing — ثبت خرید و تأمین‌کنندگان

| | |
|---|---|
| Scope | `scope:seller` |
| Figma | purchaselist `358:546`، purchase `312:9194`، purchasetotals `358:547`، purchaseattachment `358:548`، purchasedetail `358:549` |
| جریان | F17–F21، F71 (رسید خرید با چند قلم، تخفیف و هزینهٔ اضافه، ضمیمه، فاکتور تکراری) |
| Endpoints | `GET/POST …/purchases`، `GET/PUT/DELETE …/purchases/{id}`، `GET …/purchases/{id}/totals`، `POST …/purchases/{id}/finalize` ♻، `PUT …/purchases/{id}/attachments`، `GET/POST …/suppliers`، `GET …/products`، `POST …/files` (BCR-13) |

## مسیرها

| مسیر | صفحه |
|---|---|
| `~/purchases` | فهرست با فیلتر وضعیت؛ پیش‌نویس ← «ادامه ثبت» |
| `~/purchases/new[?productId=]` | کالا + «مقدار خرید» + «خلاصهٔ ورود» + تأمین‌کننده/فاکتور/تاریخ ← `POST` پیش‌نویس |
| `~/purchases/[id]/lines` | اقلام پیش‌نویس: افزودن، ویرایش، حذف (`PUT` کامل با `expectedVersion`) |
| `~/purchases/[id]/totals` | تخفیف، حمل، مالیات غیرقابل بازیافت، کنترل جمع فاکتور ← «ثبت نهایی خرید» |
| `~/purchases/[id]/attachment` | عکس یا PDF فاکتور |
| `~/purchases/[id]` | رسید نهایی |

## قواعد

- پیش‌نویس از همان قلم اول روی سرور ساخته می‌شود؛ رفرش یا دستگاه دیگر رسید را از دست نمی‌دهد و فهرست «ادامه ثبت» نشان می‌دهد.
- هر تغییر پیش‌نویس `PUT` کامل با `expectedVersion` است؛ `VERSION_CONFLICT` به‌صورت خطای قابل فهم نمایش داده می‌شود.
- «ثبت نهایی خرید» یک `FinalCommand` است (یک شناسه عملیات، بازپخش پاسخ گم‌شده، بدون رکورد دوم).
- `PURCHASE_DUPLICATE_INVOICE` ← تأیید با دلیل (`confirmDuplicateInvoiceNo` + `duplicateReason`).
- بهای نامعلوم صفر نیست: قلم با `costStatus=Unknown` و بدون مبلغ ثبت می‌شود و هشدار می‌ماند.
- «جمع فاکتور تأمین‌کننده» فقط برای کنترل اختلاف است و ذخیره نمی‌شود.
- بارگذاری فایل پشت Port `FileUploader` است (BCR-13)؛ با انتشار endpoint در بک‌اند فقط Adapter تغییر می‌کند.
- فیلتر «اصلاح‌شده» تا وجود فیلتر اصلاح در API، رسیدهای نهایی را نشان می‌دهد.
