'use client';
import { useAuthProblemCopy } from '../i18n/use-auth-problem-copy';
import { Countdown } from './Countdown';
import type { RetryWaitProps } from './RetryWait.types';

/** otp-limited (Figma 394:6076): «تا ۰۱:۰۰ دیگر دوباره تلاش کنید», ticking without re-rendering the screen. */
export function RetryWait({ until }: RetryWaitProps) {
  const { limitedMessage } = useAuthProblemCopy();
  return <Countdown until={until}>{limitedMessage}</Countdown>;
}
