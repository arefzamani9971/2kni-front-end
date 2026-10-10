import { appError } from '@dukani/domain';
import {
  assertSupportedChallenge,
  formatCountdown,
  otpProblemOf,
  retryDeadline,
  secondsUntil,
} from './otp-challenge';

describe('otp challenge rules', () => {
  it('formats the resend countdown with Persian digits', () => {
    expect(formatCountdown(60)).toBe('۰۱:۰۰');
    expect(formatCountdown(9)).toBe('۰۰:۰۹');
  });

  it('never returns negative seconds', () => {
    expect(secondsUntil('2020-01-01T00:00:00Z', Date.parse('2020-01-01T00:00:10Z'))).toBe(0);
    expect(secondsUntil('2020-01-01T00:01:00Z', Date.parse('2020-01-01T00:00:00.500Z'))).toBe(60);
  });

  it('maps backend codes to screen states', () => {
    expect(otpProblemOf(appError('BusinessRule', 'OTP_WRONG', 'x'))).toBe('wrong');
    expect(otpProblemOf(appError('BusinessRule', 'OTP_RATE_LIMITED', 'x'))).toBe('limited');
    expect(otpProblemOf(appError('Permission', 'USER_BLOCKED', 'x'))).toBe('blocked');
    expect(otpProblemOf(appError('Server', 'HTTP_500', 'x'))).toBe('other');
  });

  it('waits exactly as long as the server says (retryAfterSeconds)', () => {
    const now = Date.parse('2026-01-01T00:00:00Z');
    const limited = appError('BusinessRule', 'OTP_RATE_LIMITED', 'x', { retryAfterSeconds: 42 });
    expect(retryDeadline(limited, now)).toBe(now + 42_000);
    expect(retryDeadline(appError('BusinessRule', 'OTP_RATE_LIMITED', 'x'), now)).toBeNull();
  });

  it('rejects a code length the screen does not support instead of truncating', () => {
    const c = { requestId: 'r', mobile: '09123456789', mobileMasked: 'm', expiresAt: '', resendAvailableAt: '', codeLength: 6 };
    expect(assertSupportedChallenge(c)).toBe(c);
    expect(() => assertSupportedChallenge({ ...c, codeLength: 4 })).toThrow(
      expect.objectContaining({ code: 'OTP_CODE_LENGTH_UNSUPPORTED' }),
    );
  });
});
