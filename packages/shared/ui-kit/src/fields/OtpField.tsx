'use client';
import { DigitField } from './DigitField';
import type { DigitFieldProps } from './DigitField.types';

/**
 * One-time code (Figma «Numeric Field», Kind=OTP — AUTH-02 358:479/358:5342): six digits, SMS autofill, only
 * outer spaces are trimmed. Same look as the other numeric fields: Body/M, LTR digits from the start of the box.
 */
export function OtpField({ label = 'کد ورود', ...props }: DigitFieldProps) {
  return <DigitField label={label} autoComplete="one-time-code" transform={(raw) => raw.trim()} {...props} />;
}
