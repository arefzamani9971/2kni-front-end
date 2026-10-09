'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { DigitField } from './DigitField';
import type { DigitFieldProps } from './DigitField.types';

/** کد پستی — 10 digits. */
export function PostalCodeField({ label, placeholder, ...props }: DigitFieldProps) {
  const t = useUiTranslations();
  label ??= t('controls.postalCode');
  placeholder ??= t('controls.postalCodeExample');

  return (
    <DigitField
      label={label}
      placeholder={placeholder}
      autoComplete="postal-code"
      transform={(r) => r.replace(/[\s-]/g, '')}
      {...props}
    />
  );
}
