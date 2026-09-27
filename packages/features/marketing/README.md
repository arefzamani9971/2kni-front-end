# Feature: marketing — لندینگ

| | |
|---|---|
| Scope | `scope:landing` |
| Figma | LAND-D01 `274:3` (فقط دسکتاپ ۱۴۴۰؛ موبایل از همان بخش‌ها چیده می‌شود) |
| جریان | F64 |

- متن‌ها در `src/content.ts` است؛ چیدمان در `src/sections/*`.
- بدون JavaScript سمت کاربر (Server Components)؛ اپ `apps/landing` خروجی ایستا (`output: 'export'`) می‌سازد و nginx مستقیم سرو می‌کند.
- رنگ مشتری (Indigo) با `data-theme="customer"` روی همان توکن‌ها اعمال می‌شود؛ رنگ خام در کد نیست (به‌جز پانویس تیرهٔ فیگما).
- لینک ورود پنل‌ها از `NEXT_PUBLIC_SELLER_URL` و `NEXT_PUBLIC_CUSTOMER_URL` می‌آید.
