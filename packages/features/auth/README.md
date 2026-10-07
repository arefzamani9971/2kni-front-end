# Feature: auth — ورود با کد پیامکی

| | |
|---|---|
| Scope | `scope:shared` (اپ فروشنده و مشتری) |
| Figma فروشنده | AUTH-01 `358:478` / `358:5341`، AUTH-02 `358:479` / `358:5342`، otp-wrong `394:6038`، otp-expired `394:6059`، otp-limited `394:6076`، otp-send-failed `394:6091`، AUTH-01-ERROR `405:6105`، AUTH-02-ERROR `405:6128` |
| Figma مشتری | AUTH-01 `310:379` / `310:3`، AUTH-02 `310:396` / `310:34` |
| جریان | F01 (ورود)، تسک‌های AUTH-VALIDATION و AUTH-OTP؛ مهلت ۱۲۰ ثانیه، ۵ تلاش، ارسال دوباره بعد از ۶۰ ثانیه |
| Endpoints | `POST /api/v1/auth/otp/request`، `POST /api/v1/auth/otp/verify` (یا `POST /bff/auth/verify` در حالت live) |

## ساختار

```text
src/
├─ domain/otp-challenge.ts        شمارش معکوس، نگاشت کد خطا ← حالت صفحه، زمان صبر سرور، کنترل codeLength
├─ application/ports.ts           AuthGateway، ChallengeStore (save/load/discard/lastMobile/clear)
├─ infrastructure/
│  ├─ api-auth-gateway.ts         Adapter مستقیم API (حالت mock)
│  ├─ bff-auth-gateway.ts         Adapter BFF (حالت live؛ refresh token در کوکی httpOnly)
│  └─ session-challenge-store.ts  challenge و آخرین شماره بین صفحهٔ شماره و کد (sessionStorage)
├─ ui/hooks/use-request-otp.ts، use-verify-otp.ts، use-now.ts
├─ ui/hooks/use-otp-flow.ts       رفتار AUTH-02: تأیید، ارسال دوباره، تغییر شماره، حالت‌های خطا و اقدام هر حالت
├─ ui/screens/LoginScreen.tsx     AUTH-01
├─ ui/screens/OtpScreen.tsx       AUTH-02 (فقط نمایش؛ رفتار در useOtpFlow)
├─ ui/screens/auth-copy.constants.ts  متن هر چیدمان دقیقاً مطابق فیگما
└─ module.ts                      createAuthModule(deps) + AuthModuleProvider / useAuthModule
```

## قرارداد با اپ

اپ ماژول را یک بار پیکربندی می‌کند و فقط Screen را mount می‌کند؛ Feature مسیرهای اپ و `process.env` را نمی‌شناسد:

```ts
createAuthModule({ …, layout: 'cards' /* مشتری؛ فروشنده پیش‌فرض split */, showDevCode: process.env.NODE_ENV !== 'production' })
```

```tsx
<LoginScreen onCodeSent={() => nav.push(sellerRoutes.otp(next))} />
<OtpScreen onSignedIn={({ tokens }) => …} onChangeNumber={…} onMissingChallenge={…} />
```

## حالت‌ها

محتوای پوسته با نقش‌های `introduction` (متن معرفی)، `identity` (اطلاعات شماره) و `notice` (هشدار) ارسال می‌شود؛ جای‌گذاری آن‌ها متعلق به ui-kit است. `LoginScreen.intro` متن ساده است و همان مقدار در معرفی موبایل و پنل برند دسکتاپ استفاده می‌شود. تنظیمات اختصاصی `split` و `cards` با union مبتنی بر `layout` کنترل می‌شوند.

چیدمان `split` در دسکتاپ پنل برند و کارت ورود دارد؛ فیلد، راهنما، شمارش معکوس و اقدام‌ها داخل کارت‌اند. در موبایل نوار عنوان و اقدام ثابت پایین صفحه حفظ می‌شوند. فرم در تغییر viewport دوباره mount نمی‌شود. `cards` چیدمان مستقل مشتری است.

| کد بک‌اند | حالت صفحه | اقدام اصلی |
|---|---|---|
| — | ورود کد (پیش‌فرض) | «تأیید و ورود» (مشتری: + «بازگشت»)؛ «ارسال دوباره کد» بعد از شمارش معکوس |
| `OTP_WRONG` | کد ورود درست نیست (پیام سرور با تعداد تلاش باقی‌مانده) | «اصلاح کد» |
| `OTP_EXPIRED` یا پایان مهلت روی کلاینت | مهلت کد تمام شد | «دریافت کد جدید» |
| `OTP_RATE_LIMITED` | کمی صبر کنید؛ شمارش معکوس از `retryAfterSeconds` سرور | «تغییر شماره»، بعد از صبر «دریافت کد جدید» |
| `OTP_SEND_FAILED` (503) | کد ارسال نشد | «تلاش دوباره» |
| `USER_BLOCKED` | حساب مسدود است | «تغییر شماره» |
| اعتبارسنجی کلاینت | خطای زیر فیلد؛ دکمه تا ورودی معتبر غیرفعال است | — |

`devCode` فقط وقتی اپ `showDevCode` را روشن کند (توسعه/mock) زیر فیلد نمایش داده می‌شود.

## آزمون

`auth-flow.test.tsx` کل جریان را روی بک‌اند mock (MSW) و پشتهٔ واقعی http اجرا می‌کند (هر دو چیدمان)؛ `domain/otp-challenge.test.ts` قواعد خالص را.
