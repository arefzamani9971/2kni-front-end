# استقرار (Docker + nginx)

## ساختار

```text
Dockerfile                 یک Dockerfile برای هر سه اپ (ARG APP)
  target server            seller / customer: Next.js standalone، کاربر غیر root، پورت 3000
  target landing           خروجی ایستای لندینگ روی nginx-unprivileged، پورت 8080
compose.yaml               سه اپ + edge nginx (TLS، gzip، کش، هدرهای امنیتی)
compose.mock.yaml          دمو بدون بک‌اند: API_MODE=mock، بدون edge، پورت‌های 3000..3002
deploy/nginx/
  nginx.conf               تنظیمات کلی edge (gzip، rate limit برای /bff، حجم آپلود ۱۲MB)
  templates/*.template     هر دامنه یک فایل؛ متغیرها با envsubst تصویر رسمی nginx پر می‌شوند
  snippets/                هدرهای امنیتی، proxy به Next.js، TLS
  landing-static.conf      nginx داخل ایمیج لندینگ
.env.example               متغیرها (NEXT_PUBLIC_* هنگام build، بقیه هنگام اجرا)
```

| دامنه | سرویس | نکته |
|---|---|---|
| `2kni.ir` (و `www` ← apex) | `landing:8080` | فایل ایستا |
| `app.2kni.ir` | `seller:3000` | `/_next/static` کش یک‌ساله؛ `/bff/*` بدون کش و با rate limit |
| `my.2kni.ir` | `customer:3000` | مثل فروشنده |
| `api.2kni.ir` | `${API_UPSTREAM}` | بک‌اند .NET (خارج از این مخزن)؛ اگر edge جدا دارد فایل `30-api` را حذف کنید |

## اجرا

```bash
cp .env.example .env            # دامنه‌ها، آدرس API و مسیر گواهی‌ها
docker compose build
docker compose up -d
```

گواهی‌ها از `CERTS_DIR/live/<domain>/{fullchain,privkey}.pem` خوانده می‌شوند (ساختار certbot). مسیر
`/.well-known/acme-challenge/` روی پورت 80 از `ACME_DIR` سرو می‌شود.

دمو با بک‌اند mock (بدون TLS):

```bash
docker compose -f compose.yaml -f compose.mock.yaml up --build
# http://localhost:3000 لندینگ · :3001 فروشنده (09123456789 / 123456) · :3002 مشتری
```

## نکته‌ها

- `NEXT_PUBLIC_*` در bundle مرورگر جاگذاری می‌شوند؛ برای هر محیط ایمیج جدا بسازید.
- `API_INTERNAL_URL` آدرس API از داخل شبکهٔ Docker است و فقط route handlerهای `/bff/auth/*` از آن استفاده می‌کنند؛
  refresh token در کوکی `HttpOnly; Secure; SameSite=Lax` با مسیر `/bff/auth` می‌ماند.
- در حالت live فایل `mockServiceWorker.js` هنگام build حذف می‌شود.
- هدرهای امنیتی در هر `location` که `add_header` دارد دوباره include شده‌اند (قاعدهٔ ارث‌بری nginx).
- CSP فعلاً `'unsafe-inline'` برای اسکریپت دارد (اسکریپت‌های inline Next.js)؛ گام بعد: nonce از طریق proxy.
- ایمیج‌ها و پیکربندی edge در همین محیط با گواهی self-signed آزموده شده‌اند: ریدایرکت‌ها، هدرها، کش و BFF.
