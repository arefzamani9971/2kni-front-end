# Feature: auth — ورود با کد پیامکی

| | |
|---|---|
| Scope | `scope:shared` (اپ فروشنده و مشتری) |
| Figma | AUTH-01 `358:478`، AUTH-02 `358:479`، otp-wrong `394:6038`، otp-expired `394:6059`، otp-limited `394:6076`، otp-send-failed `394:6091`، AUTH-02-ERROR `405:6128` |
| جریان | F01 (ورود)، BIZ-BUY-02 (مهلت ۱۲۰ ثانیه، ۵ تلاش، ارسال دوباره بعد از ۶۰ ثانیه) |
| Endpoints | `POST /api/v1/auth/otp/request`، `POST /api/v1/auth/otp/verify` (یا `POST /bff/auth/verify` در حالت live) |

## ساختار

```text
src/
├─ domain/otp-challenge.ts        OtpChallenge، شمارش معکوس، نگاشت کد خطا ← حالت صفحه
├─ application/ports.ts           AuthGateway، ChallengeStore
├─ infrastructure/
│  ├─ api-auth-gateway.ts         Adapter مستقیم API (حالت mock)
│  ├─ bff-auth-gateway.ts         Adapter BFF (حالت live؛ refresh token در کوکی httpOnly)
│  └─ session-challenge-store.ts  نگه‌داری challenge بین صفحهٔ شماره و کد (sessionStorage)
├─ ui/hooks/use-auth.ts           useRequestOtp، useVerifyOtp
├─ ui/screens/LoginScreen.tsx     AUTH-01
├─ ui/screens/OtpScreen.tsx       AUTH-02 و همهٔ حالت‌ها
└─ module.ts                      createAuthModule(deps) + AuthModuleProvider / useAuthModule
```

## قرارداد با اپ

اپ فقط Screen را mount می‌کند و مسیر بعدی را تصمیم می‌گیرد؛ Feature مسیرهای اپ را نمی‌شناسد:

```tsx
<LoginScreen onCodeSent={() => nav.push(sellerRoutes.otp(next))} />
<OtpScreen onSignedIn={({ tokens }) => nav.replace(afterLogin(tokens.user))} onChangeNumber={…} onMissingChallenge={…} />
```

## حالت‌ها

| کد بک‌اند | حالت صفحه | اقدام اصلی |
|---|---|---|
| — | ورود کد (پیش‌فرض) | «تأیید و ورود»؛ «ارسال دوباره کد» بعد از شمارش معکوس |
| `OTP_WRONG` | کد ورود درست نیست (پیام سرور با تعداد تلاش باقی‌مانده) | «اصلاح کد» |
| `OTP_EXPIRED` یا پایان مهلت روی کلاینت | مهلت کد تمام شد | «دریافت کد تازه» |
| `OTP_RATE_LIMITED` | کمی صبر کنید | «تغییر شماره» |
| `OTP_SEND_FAILED` | کد ارسال نشد | «تلاش دوباره» |
| `USER_BLOCKED` | حساب مسدود است | «تغییر شماره» |
| اعتبارسنجی کلاینت | کد ناقص یا غیرعددی زیر فیلد | — |

`devCode` (فقط محیط توسعه و mock) به‌صورت راهنما زیر فیلد نمایش داده می‌شود.

## آزمون

`auth-flow.test.tsx` کل جریان را روی بک‌اند mock (MSW) و پشتهٔ واقعی http اجرا می‌کند.
