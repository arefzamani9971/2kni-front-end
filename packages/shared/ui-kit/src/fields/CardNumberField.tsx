'use client';
import { GroupedDigitsField, type GroupedProps } from './GroupedDigitsField';

/** شماره کارت — 16 digits shown as 4-4-4-4; value is the raw digits (Luhn checked by `rules.cardNumber()`). */
export function CardNumberField({ label = 'شماره کارت', placeholder = '۶۰۳۷ ۹۹۷۵ ۰۰۰۰ ۰۰۰۰', ...props }: GroupedProps) {
  return <GroupedDigitsField label={label} placeholder={placeholder} maxDigits={16} groupSize={4} autoComplete="cc-number" {...props} />;
}
