# Feature: store — فروشگاه‌های من و ساخت فروشگاه

| | |
|---|---|
| Scope | `scope:seller` |
| Figma | storeselect `358:480`، setup `312:8744`، ST02 نوع فروشگاه `385:6827` (onboarding `358:560` در فاز بعد) |
| جریان | F02 (ساخت سریع فروشگاه: فقط نام و نوع)، ورود به فروشگاه پیش‌فرض |
| Endpoints | `GET /api/v1/stores`، `POST /api/v1/stores` ♻، `GET /api/v1/store-types`، `GET /api/v1/stores/{storeId}` |

## ساختار

```text
src/
├─ domain/store.ts                      برچسب نقش و شیوهٔ فعالیت، راهنمای ST02، entryStoreId (مقصد بعد از ورود)
├─ application/ports.ts                 StoreRepository
├─ infrastructure/http-store-repository.ts  یک متد برای هر endpoint + نگاشت DTO
├─ ui/hooks/use-stores.ts               useMyStores، useStoreTypes، useStore، useCreateStore (FinalCommand ♻)
├─ ui/screens/StoresScreen.tsx          storeselect
├─ ui/screens/CreateStoreScreen.tsx     setup + گام ST02
└─ ui/StoreGate.tsx                     گیت `/s/[storeId]`: نقش و مجوزها ← ActiveStore (platform)
```

## نکته‌ها

- `ActiveStore` و `useCan(permission)` در `@dukani/platform` است تا Featureهای دیگر بدون وابستگی به این Feature از فروشگاه فعال و مجوزها استفاده کنند.
- ساخت فروشگاه Idempotent است؛ پاسخ گم‌شده حالت «در حال بررسی نتیجه» را نشان می‌دهد و «بررسی دوباره» همان شناسه عملیات را می‌فرستد.
- «ثبت بقیه اطلاعات (اختیاری)» تا ساخت Feature تنظیمات فروشگاه پنهان است (`onMoreInfo`).
