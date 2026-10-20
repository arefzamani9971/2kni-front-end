# Feature: store — فروشگاه‌های من، ساخت، مشاهده و ویرایش فروشگاه، و گیت فروشگاه

| | |
|---|---|
| Scope | `scope:seller` |
| جریان | F02 (ساخت سریع + تکمیل اختیاری هنگام ثبت)، F03 (مشاهده و ویرایش فروشگاه موجود)، ST-V2، ورود به فروشگاه پیش‌فرض |
| Figma موبایل | storeselect `358:480`، setup `312:8744`، ST02 نوع فروشگاه `385:6827`، تماس و نشانی `358:481`، مالک و تسویه `358:482`، موقعیت `594:6736`، ساعات `594:6767`، STORE-04 `385:6853`، STORE-05 `385:6912`، leaveform `594:6931` |
| Figma دسکتاپ | `358:5343`، `312:201`، `358:5344`، `358:5345`، `597:4205`، `597:4269` |
| Endpoints | `GET /api/v1/stores`، `POST /api/v1/stores` ♻، `GET /api/v1/store-types`، `GET /api/v1/stores/{storeId}`، `PUT …/profile` ⟳، `POST …/logo` ⟳، `GET/PUT …/private-info` ⟳، `GET …/type-change-preview` (⟳ = expectedVersion/version، نسخهٔ کهنه 409) |

## ساختار

```text
src/
├─ domain/store.ts                        entryStoreId (مقصد بعد از ورود؛ فروشگاه از دست‌رفته وارد نمی‌شود)
├─ domain/store-draft.ts                  پیش‌نویس ساخت: hasPublicInfo، buildProfileUpdate، toOpeningHours
├─ domain/store-profile-model.types.ts   مدل‌های مستقل فیچر و فرمان ویرایش (بدون DTO)
├─ infrastructure/store-mappers.ts       تبدیل DTO و فرمان داخلی در مرز HTTP
├─ domain/store-profile.ts                F03: applyProfilePatch (آخرین فروشگاه + تغییرات + نسخه؛ F02 هم از آن استفاده می‌کند)، ساعات ← preset، مدل نمایش STORE-04
├─ application/ports.ts                   StoreRepository، StoreDraftRepository
├─ infrastructure/http-store-repository.ts    یک متد برای هر endpoint + نگاشت DTO (چهار مجموعهٔ GET /stores جدا)
├─ infrastructure/store-draft-repository.ts   پیش‌نویس در DraftStore با کلید `pending:userId:store-create`
├─ ui/hooks/use-store-setup.ts            ارکستراسیون: POST یک‌باره ♻ ← profile ← logo ← private روی همان storeId
├─ ui/hooks/use-store-profile-editor.ts  F03: baseline ثابت، 409 ← آخرین نسخه + حفظ فرم، لوگوی فوری، بخش خصوصی مستقل
├─ ui/hooks/use-my-stores.ts، use-store-types.ts، use-store.ts
├─ ui/components/                         StoreSetupForm، StoreTypeStep، مراحل اختیاری، StoreSetupResult (+ .schema/.types/.constants)
├─ ui/screens/StoresScreen.tsx            storeselect
├─ ui/screens/CreateStoreScreen.tsx       setup ← مراحل اختیاری ← STORE-SUCCESS روی یک مسیر
├─ ui/screens/StoreInfoScreen.tsx         STORE-04
├─ ui/screens/StoreEditScreen.tsx         STORE-05 / تماس / خصوصی (entry)، با زیرصفحه‌های نوع، موقعیت، ساعات و leaveform
└─ ui/components/StoreGate.tsx            گیت `/s/[storeId]`: نقش و مجوزها ← ActiveStore (platform)
```

## نکته‌ها

- mapperهای HTTP مقدارهای optional را به null صریح تبدیل می‌کنند و صفر مختصات/صفر آغازین شناسه‌ها را حفظ می‌کنند. فرمان ویرایش فقط فیلدهای مجاز را دارد؛ `version` داخلی در mapper به `expectedVersion` تبدیل می‌شود. metadata نقش و مجوز در StoreDetail می‌ماند و وارد فرمان پروفایل نمی‌شود.
- پیش از «ساخت فروشگاه» هیچ مرحلهٔ اختیاری درخواستی نمی‌فرستد؛ شناسهٔ عملیات پیش از ارسال در پیش‌نویس ذخیره می‌شود تا refresh فروشگاه دوم نسازد.
- اطلاعات بانکی/هویتی و عکس فقط در حافظه‌اند و هرگز در پیش‌نویس محلی ذخیره نمی‌شوند.
- شکست یک بخش اختیاری فقط همان بخش را دوباره می‌فرستد؛ `POST /stores` تکرار نمی‌شود.
- یک متن و یک رفتار در موبایل و دسکتاپ؛ چیدمان دسکتاپ با `TwoColumnWorkspace`، `FormColumn` و `ContentColumns` ui-kit.
- F03: هر صفحه فقط مقدارهای خودش را تغییر می‌دهد و ذخیره «آخرین فروشگاه + تغییرات» را با `expectedVersion` همان نسخه‌ای می‌فرستد که کاربر ویرایش کرده است. در 409 هیچ چیز بازنویسی نمی‌شود؛ ذخیرهٔ دوباره، تغییرات را روی نسخهٔ تازه می‌گذارد.
- مراحل اختیاری با `context="edit"` در F03 هم استفاده می‌شوند (فقط متن دکمه‌ها فرق می‌کند).
- کارت‌های «روش‌های فروش/پرداخت» STORE-04 مال ۳.۰ هستند و در ۱.۰ رندر نمی‌شوند. پیش‌نویس محلی ویرایش («ذخیرهٔ پیش‌نویس» در leaveform) هنوز ساخته نشده است.
