# Feature: products — کالاهای فروشگاه

| | |
|---|---|
| Scope | `scope:seller` |
| Figma | products `312:9504`، empty `312:10728`، detail `312:9534`، newdetail `312:10745` |
| جریان | F15 (فهرست و جست‌وجو)، F16 (نمایش قیمت)، سوابق موجودی |
| Endpoints | `GET …/products` (q، stockState، costStatus، cursor)، `GET …/products/{productId}`، `GET …/inventory/{productId}/movements` |

- فیلترها در URL می‌مانند (`?stock=Low`، `?cost=Unknown`) تا لینک‌های «نیازمند توجه» خانه مستقیم به فهرست فیلترشده بیایند.
- «افزودن موجودی» در جزئیات به ثبت خرید با کالای انتخاب‌شده می‌رود (`~/purchases/new?productId=`).
- بهای نامعلوم هرگز صفر نمایش داده نمی‌شود؛ هشدار روی صفحه می‌ماند (ui-guidelines).
- کلید کش `['products', storeId, …]` است؛ ثبت کالا و ثبت خرید همین دامنه را invalidate می‌کنند.
- «نام و یادداشت فروشگاه» و «مشخصات کاتالوگ اشتباه است» به صفحه‌های فاز بعد (local، correction) لینک‌اند.
