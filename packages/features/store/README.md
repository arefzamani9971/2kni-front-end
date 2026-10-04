# Feature: store — فروشگاه‌های من، ساخت فروشگاه و گیت فروشگاه

| | |
|---|---|
| Scope | `scope:seller` |
| جریان | F02 (ساخت سریع فروشگاه + تکمیل اختیاری هنگام ثبت)، ورود به فروشگاه پیش‌فرض |
| Figma موبایل | storeselect `358:480`، setup `312:8744`، ST02 نوع فروشگاه `385:6827`، تماس و نشانی `358:481`، مالک و تسویه `358:482`، موقعیت `594:6736`، ساعات `594:6767` |
| Figma دسکتاپ | `358:5343`، `312:201`، `358:5344`، `358:5345`، `597:4205`، `597:4269` |
| Endpoints | `GET /api/v1/stores`، `POST /api/v1/stores` ♻، `GET /api/v1/store-types`، `GET /api/v1/stores/{storeId}`، `PUT …/profile`، `POST …/logo`، `PUT …/private-info` |

## ساختار

```text
src/
├─ domain/store.ts                        entryStoreId (مقصد بعد از ورود؛ فروشگاه از دست‌رفته وارد نمی‌شود)
├─ domain/store-draft.ts                  پیش‌نویس ساخت: hasPublicInfo، toProfileRequest (full replace با merge)، toOpeningHours
├─ application/ports.ts                   StoreRepository، StoreDraftRepository
├─ infrastructure/http-store-repository.ts    یک متد برای هر endpoint + نگاشت DTO (چهار مجموعهٔ GET /stores جدا)
├─ infrastructure/store-draft-repository.ts   پیش‌نویس در DraftStore با کلید `pending:userId:store-create`
├─ ui/hooks/use-store-setup.ts            ارکستراسیون: POST یک‌باره ♻ ← profile ← logo ← private روی همان storeId
├─ ui/hooks/use-my-stores.ts، use-store-types.ts، use-store.ts
├─ ui/components/                         StoreSetupForm، StoreTypeStep، مراحل اختیاری، StoreSetupResult (+ .schema/.types/.constants)
├─ ui/screens/StoresScreen.tsx            storeselect
├─ ui/screens/CreateStoreScreen.tsx       setup ← مراحل اختیاری ← STORE-SUCCESS روی یک مسیر
└─ ui/StoreGate.tsx                       گیت `/s/[storeId]`: نقش و مجوزها ← ActiveStore (platform)
```

## نکته‌ها

- پیش از «ساخت فروشگاه» هیچ مرحلهٔ اختیاری درخواستی نمی‌فرستد؛ شناسهٔ عملیات پیش از ارسال در پیش‌نویس ذخیره می‌شود تا refresh فروشگاه دوم نسازد.
- اطلاعات بانکی/هویتی و عکس فقط در حافظه‌اند و هرگز در پیش‌نویس محلی ذخیره نمی‌شوند.
- شکست یک بخش اختیاری فقط همان بخش را دوباره می‌فرستد؛ `POST /stores` تکرار نمی‌شود.
- یک متن و یک رفتار در موبایل و دسکتاپ؛ چیدمان دسکتاپ با `TwoColumnWorkspace`، `FormColumn` و `ContentColumns` ui-kit.
