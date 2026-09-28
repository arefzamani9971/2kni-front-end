'use client';
import { DigitField, type DigitFieldProps } from './DigitField';
import { normalizeMobileInput } from './normalize-mobile-input';

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
