import type { Dto } from '@dukani/contracts';
import { parseIranMobile, toPersianDigits } from '@dukani/domain';
import { FIXTURE } from '../db/fixtures';
import { randomId } from '../db/ids';
import { ACCESS_TOKEN_TTL_MS, type MockDb } from '../db/mock-db';
import type { UserRecord } from '../db/state';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { toUserDto } from './dto';

const OTP_TTL = 120_000;
const OTP_RESEND = 60_000;
const OTP_MAX_ATTEMPTS = 5;
const REFRESH_TTL = 30 * 24 * 3600_000;
/** Mobile that the mock treats as blocked (USER_BLOCKED state of AUTH-02). */
export const BLOCKED_MOBILE = '09129999999';

const maskMobile = (m: string) => `${m.slice(0, 4)}***${m.slice(-4)}`;

const tokens = (db: MockDb, user: UserRecord, isNewUser: boolean): Dto<'AuthTokensDto'> => {
  const refreshToken = `mock-refresh.${randomId()}`;
  const expiresAt = Date.now() + REFRESH_TTL;
  db.state.sessions.push({ refreshToken, userId: user.id, expiresAt });
  return {
    accessToken: db.issueAccessToken(user.id),
    accessTokenExpiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString(),
    refreshToken,
    refreshTokenExpiresAt: new Date(expiresAt).toISOString(),
    user: toUserDto(user),
    isNewUser,
  };
};

/** Identity module: OTP login, refresh rotation, logout and `/me` (AUTH-01/02). */
export const identityHandlers = (db: MockDb) => [
  route.post('/api/v1/auth/otp/request', ({ body }) => {
    const parsed = parseIranMobile(body.mobile ?? '');
    if (!parsed.ok) throw fail.validation('mobile', parsed.error.message, 'MOBILE_INVALID');
    const mobile = parsed.value as string;
    const now = Date.now();
    const last = db.state.otps.filter((o) => o.mobile === mobile && !o.used).at(-1);
    if (last && last.resendAt > now) {
      const seconds = Math.ceil((last.resendAt - now) / 1000);
      throw fail.rule('OTP_RATE_LIMITED', `برای دریافت کد جدید ${toPersianDigits(String(seconds))} ثانیه صبر کنید.`);
    }
    const otp = { requestId: randomId(), mobile, code: FIXTURE.otpCode, expiresAt: now + OTP_TTL, resendAt: now + OTP_RESEND, attempts: 0, used: false };
    db.mutate((s) => (s.otps = [...s.otps.filter((o) => o.mobile !== mobile), otp]));
    return {
      requestId: otp.requestId,
      mobileMasked: maskMobile(mobile),
      expiresAt: new Date(otp.expiresAt).toISOString(),
      resendAvailableAt: new Date(otp.resendAt).toISOString(),
      codeLength: 6,
      devCode: otp.code,
    };
  }),

  route.post('/api/v1/auth/otp/verify', ({ body }) =>
    db.mutate((s) => {
      const otp = s.otps.find((o) => o.requestId === body.requestId);
      if (!otp || otp.used) throw fail.rule('OTP_EXPIRED', 'این کد دیگر معتبر نیست؛ کد جدید بگیرید.');
      if (otp.expiresAt < Date.now()) throw fail.rule('OTP_EXPIRED', 'مهلت این کد تمام شده است؛ کد جدید بگیرید.');
      if (otp.attempts >= OTP_MAX_ATTEMPTS) throw fail.rule('OTP_RATE_LIMITED', 'تعداد تلاش‌ها بیش از حد مجاز است؛ کد جدید بگیرید.');
      if (otp.code !== body.code) {
        otp.attempts += 1;
        const left = OTP_MAX_ATTEMPTS - otp.attempts;
        throw fail.rule(
          'OTP_WRONG',
          left > 0
            ? `کد واردشده درست نیست. ${toPersianDigits(String(left))} تلاش دیگر باقی است.`
            : 'کد واردشده درست نیست و فرصت تلاش تمام شد؛ کد جدید بگیرید.',
        );
      }
      if (otp.mobile === BLOCKED_MOBILE)
        throw fail.forbidden('USER_BLOCKED', 'حساب کاربری شما مسدود است؛ برای پیگیری با پشتیبانی تماس بگیرید.');
      otp.used = true;
      let user = s.users.find((u) => u.mobile === otp.mobile);
      const isNewUser = !user;
      if (!user) {
        user = { id: randomId(), mobile: otp.mobile, displayName: null, defaultStoreId: null, platformRoles: [] };
        s.users.push(user);
      }
      return tokens(db, user, isNewUser);
    }),
  ),

  route.post('/api/v1/auth/refresh', ({ body }) =>
    db.mutate((s) => {
      const session = s.sessions.find((x) => x.refreshToken === body.refreshToken);
      const user = session && s.users.find((u) => u.id === session.userId);
      if (!session || !user || session.expiresAt < Date.now())
        throw fail.unauthorized('REFRESH_TOKEN_INVALID', 'نشست شما تمام شده است؛ دوباره وارد شوید.');
      s.sessions = s.sessions.filter((x) => x !== session);
      return tokens(db, user, false);
    }),
  ),

  route.post('/api/v1/auth/logout', ({ request }) => {
    const user = db.requireUser(request);
    db.mutate((s) => (s.sessions = s.sessions.filter((x) => x.userId !== user.id)));
    return null;
  }),

  route.get('/api/v1/me', ({ request }) => toUserDto(db.requireUser(request))),

  route.put('/api/v1/me', ({ request, body }) => {
    const user = db.requireUser(request);
    return db.mutate(() => {
      user.displayName = body.displayName?.trim() || null;
      if (body.defaultStoreId !== undefined) user.defaultStoreId = body.defaultStoreId ?? null;
      return toUserDto(user);
    });
  }),
];
