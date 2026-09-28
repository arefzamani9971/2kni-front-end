'use client';
import { DigitField, type DigitFieldProps } from './DigitField';

/** تلفن ثابت با پیش‌شماره — 11 digits. */
export function LandlineField({ label = 'تلفن ثابت', placeholder = '۰۲۱۱۲۳۴۵۶۷۸', ...props }: DigitFieldProps) {
  return <DigitField label={label} placeholder={placeholder} type="tel" autoComplete="tel" transform={(r) => r.replace(/[\s-]/g, '')} {...props} />;
}
