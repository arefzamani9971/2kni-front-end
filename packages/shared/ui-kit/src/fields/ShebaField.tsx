'use client';
import { GroupedDigitsField, type GroupedProps } from './GroupedDigitsField';

/**
 * شماره شبا — fixed `IR` prefix + 24 digits grouped by 4. The emitted value is `IR` + digits
 * (checked by `rules.sheba()`); an `IR…` value from the server is accepted as input.
 */
export function ShebaField({ label = 'شماره شبا', placeholder = '۰۶ ۰۱۲۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰', value, defaultValue, onChange, ...props }: GroupedProps) {
  const strip = (v?: string) => (v === undefined ? undefined : v.toUpperCase().replace(/^IR/, ''));
  return (
    <GroupedDigitsField
      label={label}
      placeholder={placeholder}
      maxDigits={24}
      groupSize={4}
      prefix={<span dir="ltr" className="text-body-m text-fg-primary">IR</span>}
      value={strip(value)}
      defaultValue={strip(defaultValue)}
      onChange={(digits) => onChange?.(digits ? `IR${digits}` : '')}
      {...props}
    />
  );
}
