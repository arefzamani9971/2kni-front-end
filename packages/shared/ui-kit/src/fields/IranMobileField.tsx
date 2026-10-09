'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { DigitField } from './DigitField';
import type { DigitFieldProps } from './DigitField.types';
import { normalizeMobileInput } from './normalize-mobile-input';

/** Iranian mobile (Kind=MobileIR). Long input is not silently cut; the form validator reports it. */
export function IranMobileField({ label, placeholder, ...props }: DigitFieldProps) {
  const t = useUiTranslations();
  label ??= t('controls.mobile');
  placeholder ??= t('controls.mobileExample');

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
