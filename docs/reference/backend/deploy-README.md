# استقرار دکانی (Docker، دو سرور Ubuntu)

```text
سرور ۱ (موجود)   Git + Frontend + Dukani API + Worker   ← عمومی، پشت nginx (TLS)
سرور ۲ (جدید)    PostgreSQL 18 + ذخیره فایل (S3) + بکاپ شبانه   ← فقط شبکه خصوصی
```

| فایل | کاربرد |
|---|---|
| `Dockerfile` (ریشه مخزن) | سه image از یک build: `api`، `worker`، `seeder` |
| `deploy/db/docker-compose.yml` | سرور ۲: PostgreSQL، ذخیره فایل (MinIO)، بکاپ |
| `deploy/db/init/01-roles.sh` | ساخت دو نقش دیتابیس (اجرای اول) |
| `deploy/db/backup/backup.sh` | بکاپ `pg_dump` شبانه با حذف نسخه‌های قدیمی |
| `deploy/app/docker-compose.yml` | سرور ۱: `api`، `worker`، `migrate` و `seeder` (دو تای آخر یک‌بارمصرف‌اند) |
| `deploy/app/nginx/dukani.conf` | نمونه تنظیم nginx برای `api.` و `files.` |

## ۱. سرور دیتابیس (سرور ۲)

```bash
sudo apt install docker.io docker-compose-v2
sudo mkdir -p /srv/dukani/{postgres,minio,backups}
sudo chown -R 65532:65532 /srv/dukani/minio      # کاربر غیر root کانتینر ذخیره فایل
cd deploy/db && cp .env.example .env && nano .env   # PRIVATE_IP و رمزها
docker compose up -d
docker compose logs -f postgres                     # «database system is ready»
```

فایروال: پورت‌های 5432 و 9000 فقط برای IP خصوصی سرور ۱ باز باشند.

```bash
sudo ufw default deny incoming
sudo ufw allow OpenSSH
sudo ufw allow from <IP-خصوصی-سرور-۱> to any port 5432 proto tcp
sudo ufw allow from <IP-خصوصی-سرور-۱> to any port 9000 proto tcp
sudo ufw enable
```

> Docker با iptables خودش پورت‌ها را باز می‌کند. به همین دلیل پورت‌ها در compose فقط روی `PRIVATE_IP` bind شده‌اند.

**نقش‌های دیتابیس:**

| نقش | کاربرد |
|---|---|
| `dukani_owner` | مالک دیتابیس؛ فقط برای Migration و بکاپ |
| `dukani_app` | API و Worker با این نقش کار می‌کنند و فقط خواندن و نوشتن داده دارند، بدون تغییر ساختار |

**ذخیره فایل:** MinIO از ۲۰۲۵ image رسمی Docker Hub را منتشر نمی‌کند. پیش‌فرض ما build رایگان Chainguard است (`cgr.dev/chainguard/minio`). هر سرویس سازگار با S3 هم کار می‌کند، چون کد فقط از پروتکل S3 استفاده می‌کند. در محیط اصلی image را روی یک digest مشخص ثابت کنید.

## ۲. ساخت Migration (یک بار، روی سیستم توسعه)

در مخزن هنوز Migration نیست. روی سیستم خودتان با .NET 10 SDK اجرا کنید و نتیجه را کامیت کنید:

```bash
dotnet tool install --global dotnet-ef
dotnet build
dotnet ef migrations add Initial --project src/Dukani.Api --startup-project src/Dukani.Api --output-dir Migrations
git add src/Dukani.Api/Migrations && git commit -m "Initial migration"
```

## ۳. سرور اپلیکیشن (سرور ۱)

```bash
cd deploy/app && cp .env.example .env && nano .env
openssl rand -base64 48      # برای JWT_SIGNING_KEY و OTP_SECRET (هر کدام جدا)

docker compose build
docker compose --profile migrate run --rm migrate           # Migration + ساخت bucket
docker compose up -d api worker
curl -s http://127.0.0.1:8080/health                        # Healthy

# داده اولیه کاتالوگ (۴ نوع فروشگاه)
docker compose --profile tools run --rm seeder validate /seed/dukani-seed-v1.json
docker compose --profile tools run --rm seeder apply /seed/dukani-seed-v1.json
```

سپس `nginx/dukani.conf` را در `/etc/nginx/sites-available/` بگذارید، دامنه‌ها و IP را عوض کنید، گواهی را با `certbot --nginx -d api.dukani.ir -d files.dukani.ir` بگیرید و `nginx -s reload` کنید.

**پیامک:** در پنل کاوه‌نگار این قالب‌های verify را بسازید (نام‌ها در `appsettings.json` → `Sms:Templates` قابل تغییرند):

| قالب | توکن‌ها |
|---|---|
| `dukani-otp` | %token = کد |
| `dukani-invoice` | فروشگاه، مبلغ به تومان، لینک |
| `dukani-order` | فروشگاه، شماره سفارش، وضعیت |
| `dukani-order-ready` | فروشگاه، شماره سفارش، کد تحویل |
| `dukani-invite` | فروشگاه، لینک |
| `dukani-settlement` | فروشگاه، وضعیت |

برای محیط تست، `SMS_PROVIDER=Fake` بگذارید تا کدها فقط در لاگ API ظاهر شوند.

## ۴. انتشار نسخه جدید

```bash
git pull
cd deploy/app
docker compose build
docker compose --profile migrate run --rm migrate
docker compose up -d api worker
```

`--migrate` فقط Migrationهای جدید را اعمال می‌کند. Worker چند نمونه‌ای هم امن است، چون Outbox با `SKIP LOCKED` کار می‌کند.

## ۵. بکاپ و بازیابی

- **بکاپ شبانه:** ساعت `BACKUP_HOUR` به وقت تهران در `/srv/dukani/backups` ساخته می‌شود و `BACKUP_RETENTION_DAYS` روز نگه داشته می‌شود.
- **حتماً** این پوشه را به جای دیگری (دیتاسنتر یا سرویس دیگر) کپی کنید، مثلاً با `rclone` یا `rsync` در cron.
- **فایل‌های MinIO** (`/srv/dukani/minio`) هم باید جدا بکاپ شوند (`rclone sync`).

**تست بازیابی (ماهی یک بار):**

```bash
docker compose exec postgres createdb -U postgres dukani_restore_test
docker compose exec -T postgres pg_restore -U postgres -d dukani_restore_test --no-owner < /srv/dukani/backups/dukani-YYYYMMDD-HHMM.dump
docker compose exec postgres dropdb -U postgres dukani_restore_test
```

**گام بعد:** برای بازیابی تا یک لحظه مشخص (PITR)، pgBackRest یا WAL-G با آرشیو WAL اضافه شود. بکاپ فعلی فقط وضعیت هر شب را نگه می‌دارد.

## ۶. پایش

- **سلامت API:** `GET /health`، که اتصال دیتابیس را هم چک می‌کند.
- **کوئری‌های کند:** `pg_stat_statements` فعال است. کوئری‌های بیشتر از ۵۰۰ میلی‌ثانیه در لاگ PostgreSQL ثبت می‌شوند.
- **لاگ کانتینرها:** `docker compose logs -f api worker`. حجم لاگ با `max-size` محدود شده است.
