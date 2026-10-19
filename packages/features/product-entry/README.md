# Feature: product-entry — ثبت کالا در فروشگاه

| | |
|---|---|
| Scope | `scope:seller` |
| جریان | F07 (جست‌وجو و انتخاب از کاتالوگ)، F09 (نتیجهٔ بارکد)، F10 (ثبت کاتالوگ و کالای فروشگاه)، F12 (واحد و بسته)، F13 (موجودی اولیه)، F16 (قیمت) |
| Figma (صفحه 17) | method `312:8778`، search `312:8803`، barcode `358:490`، details/catalog `312:8837`، units `312:9135`، stock `312:9170`، pricing `312:9409` (pricingknown `312:10785`، pricingestimated `312:10851`)، review `312:9441` (reviewknown `312:10817`، reviewestimated `312:10883`)، success `312:9475` |
| مسیرها | `sellerRoutes.entry.method / search / barcode / draft(id, draftId, step)` |

## Endpoints

| کار | Endpoint |
|---|---|
| کاتالوگ و نوع کالا | `GET …/catalog/items`، `GET …/catalog/items/{itemId}`، `GET …/catalog/items/title-check`، `GET …/catalog/product-types`، `GET …/catalog/product-types/{productTypeId}`، `GET …/catalog/brands` |
| بارکد | `GET …/barcodes/{code}` |
| تأمین‌کننده | `GET …/suppliers` |
| قیمت | `POST …/products/pricing/preview` |
| ثبت | `POST …/product-entry/preview`، `POST …/product-entry/register` ♻ (Idempotency-Key از پیش‌نویس) |
| کالای موجود | `GET …/products`، `GET …/products/{productId}` |

(`…` = `/api/v1/stores/{storeId}`)

## ساختار

```text
src/
├─ domain/entry-draft.ts                  مراحل جادوگر، واحدها و تبدیل، بهای هر واحد پایه، toRegisterRequest
├─ application/ports.ts                   EntryCatalog، EntryCommands، EntryDrafts
├─ infrastructure/http-entry-api.ts       یک متد برای هر endpoint + نگاشت DTO
├─ infrastructure/entry-draft-repository.ts  پیش‌نویس در DraftStore (کلید فروشگاه + کاربر)
└─ ui/
   ├─ common/                            نشست پیش‌نویس، ناوبری، شروع جریان، پوسته‌ها و نمایش مشترک
   ├─ identification/                    روش ورود، بارکد، جستجو، انتخاب و اصلاح شناسایی
   ├─ details/                           مشخصات، ویژگی‌ها، تصویر و ایجاد درجا
   ├─ units/                             ویرایش واحد و بسته
   ├─ stock/                             منشأ و موجودی اولیه
   ├─ pricing/                           قیمت‌گذاری و پیش‌نمایش
   ├─ bulk/                              ثبت گروهی
   ├─ attachments/                       اتصال کالاهای کاتالوگ به فروشگاه
   ├─ review/                            مرور و نتیجهٔ ثبت
   ├─ i18n/                              کاتالوگ ترجمه و اتصال به مترجم
   └─ tests/                             تست‌های ترکیبی چند بخش
```

داخل هر بخش فقط دسته‌های لازم ساخته می‌شوند: `screens/components/hooks/state/presentation/types/constants/schemas/tests`.
فایل همراه در دستهٔ خودش می‌ماند؛ داخل components فقط کامپوننت و داخل hooks فقط هوک قرار دارد.
بخش به بخش دیگر import مستقیم ندارد؛ اجزای مشترک در common و ترکیب واقعی چند بخش در `ui/screens` قرار می‌گیرند (فعلاً چنین صفحه‌ای نداریم).
قرارداد Save در `common/types/use-entry-draft.types.ts` و مالک آن در `common/hooks/use-entry-draft.ts` است.
API عمومی `src/index.ts` ثابت است. سیاست اجرا در `tools/architecture/ui-organization.mjs` ثبت شده و checker همان ابزار معماری مخزن است.

## نکته‌ها

- پیش‌نویس هر مرحله با کلید `storeId:userId:product-entry:draftId` ذخیره می‌شود؛ refresh یا بستن مرورگر ورود را از دست نمی‌دهد و کاربر دیگر آن را نمی‌بیند.
- مقدار و پول Decimal string است؛ «بها نامعلوم» صفر نیست (`costStatus: Unknown`).
- تاریخ تولید بعد از انقضا یا در آینده پذیرفته نمی‌شود (`StockForm.schema.ts`، تست دارد).
- ثبت نهایی idempotent است و پاسخ گم‌شده را با همان شناسهٔ عملیات بررسی می‌کند.
