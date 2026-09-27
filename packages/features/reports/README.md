# Feature: reports — خلاصهٔ خانه و گزارش‌ها

| | |
|---|---|
| Scope | `scope:seller` |
| Figma | home `312:8673` (بخش‌های Metrics، «نیازمند توجه»، «فروش این هفته») |
| Endpoints | `GET …/reports/summary?period=Today`، `GET …/reports/sales?period=ThisWeek&groupBy=Day`، `GET …/actions/counts` |

این Feature فقط بخش‌های دادهٔ خانه را می‌سازد؛ صفحهٔ خانه در اپ (`apps/seller/src/widgets/home`) این بخش‌ها را با
دکمه‌های «کارهای روزانه» ترکیب می‌کند، چون مسیرها مال اپ‌اند (Feature مسیر Feature دیگر را نمی‌شناسد).

| بخش | داده | قاعده |
|---|---|---|
| `TodayMetricsRow` | `netSales.current`، `receivedRials` | پول Decimal بدون تبدیل ریال/تومان (BCR-01)؛ برچسب «تومان» |
| `AttentionSection` | `byKind` از action center | فقط نوع‌هایی که اقدام دارند؛ دکمهٔ رفع از اپ می‌آید (`actions`) |
| `WeekSalesSection` | `series` روزانه | هزار تومان، هفته از شنبه، تاریخ شمسی |
