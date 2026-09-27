'use client';
// Numeric Field family (Figma 403:2: MobileIR | OTP | Integer) and other digit-only identity fields.
// All share the DigitInput contract: digits-only string, Persian/Arabic digits normalized, leading
// zeros kept, never converted to Number, LTR isolated value inside the RTL form (ui-guidelines 2.4.1).
import { normalizeDigits } from '@dukani/domain';
import { TextField, type TextFieldProps } from './TextField';

type DigitFieldProps = Omit<TextFieldProps, 'filter' | 'asciiDigits' | 'dir' | 'inputMode'>;

/** Base for digit-only inputs. */
export function DigitField(props: DigitFieldProps) {
  return <TextField dir="ltr" inputMode="numeric" filter="digits" asciiDigits {...props} />;
}

/** Converts pasted `+98 912 345 6789` / `0098…` and spaces/dashes to `09…` BEFORE the digit filter. */
export const normalizeMobileInput = (raw: string): string => {
  let s = normalizeDigits(raw).replace(/[\s-]/g, '');
  if (s.startsWith('+98')) s = `0${s.slice(3)}`;
  else if (s.startsWith('0098')) s = `0${s.slice(4)}`;
  return s;
};

/** Iranian mobile (Kind=MobileIR). Long input is not silently cut; the form validator reports it. */
export function IranMobileField({ label = 'شماره موبایل', placeholder = '۰۹۱۲۳۴۵۶۷۸۹', ...props }: DigitFieldProps) {
  return (
    <DigitField
      label={label}
      placeholder={placeholder}
      type="tel"
      autoComplete="tel-national"
      transform={normalizeMobileInput}
      {...props}
    />
  );
}

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

/** Unsigned integer (Kind=Integer). Decimal quantities use DecimalField. */
export function IntegerField(props: DigitFieldProps) {
  return <DigitField {...props} />;
}

/** کد ملی — 10 digits; checksum validated by the form rule `rules.nationalId()`. */
export function NationalIdField({ label = 'کد ملی', placeholder = '۰۰۱۲۳۴۵۶۷۸', ...props }: DigitFieldProps) {
  return <DigitField label={label} placeholder={placeholder} transform={(r) => r.replace(/[\s-]/g, '')} {...props} />;
}

/** کد پستی — 10 digits. */
export function PostalCodeField({ label = 'کد پستی', placeholder = '۱۲۳۴۵۶۷۸۹۰', ...props }: DigitFieldProps) {
  return <DigitField label={label} placeholder={placeholder} autoComplete="postal-code" transform={(r) => r.replace(/[\s-]/g, '')} {...props} />;
}

/** تلفن ثابت با پیش‌شماره — 11 digits. */
export function LandlineField({ label = 'تلفن ثابت', placeholder = '۰۲۱۱۲۳۴۵۶۷۸', ...props }: DigitFieldProps) {
  return <DigitField label={label} placeholder={placeholder} type="tel" autoComplete="tel" transform={(r) => r.replace(/[\s-]/g, '')} {...props} />;
}
