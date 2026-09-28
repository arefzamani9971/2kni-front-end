'use client';
import { DigitField, type DigitFieldProps } from './DigitField';

/** کد ملی — 10 digits; checksum validated by the form rule `rules.nationalId()`. */
export function NationalIdField({ label = 'کد ملی', placeholder = '۰۰۱۲۳۴۵۶۷۸', ...props }: DigitFieldProps) {
  return <DigitField label={label} placeholder={placeholder} transform={(r) => r.replace(/[\s-]/g, '')} {...props} />;
}
