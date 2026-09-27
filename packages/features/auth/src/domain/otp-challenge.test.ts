import { appError } from '@dukani/domain';
import { formatCountdown, otpProblemOf, secondsUntil } from './otp-challenge';

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
});
