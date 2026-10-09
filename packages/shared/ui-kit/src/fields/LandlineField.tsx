'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { DigitField } from './DigitField';
import type { DigitFieldProps } from './DigitField.types';

/** تلفن ثابت با پیش‌شماره — 11 digits. */
export function LandlineField({ label, placeholder, ...props }: DigitFieldProps) {
  const t = useUiTranslations();
  label ??= t('controls.landline');
  placeholder ??= t('controls.landlineExample');

  return (
    <DigitField
      label={label}
      placeholder={placeholder}
      type="tel"
      autoComplete="tel"
      transform={(r) => r.replace(/[\s-]/g, '')}
      {...props}
    />
  );
}
