'use client';
import { DigitField, type DigitFieldProps } from './DigitField';

/** One-time code (Kind=OTP): six digits, SMS autofill, only outer spaces are trimmed. */
export function OtpField({ label = 'کد ورود', ...props }: DigitFieldProps) {
  return (
    <DigitField
      label={label}
      autoComplete="one-time-code"
      transform={(raw) => raw.trim()}
      classNames={{ input: 'tracking-[0.5em] text-center text-body-l', ...props.classNames }}
      {...props}
    />
  );
}
