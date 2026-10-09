'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { DigitField } from './DigitField';
import type { DigitFieldProps } from './DigitField.types';

/** کد ملی — 10 digits; checksum validated by the form rule `rules.nationalId()`. */
export function NationalIdField({ label, placeholder, ...props }: DigitFieldProps) {
  const t = useUiTranslations();
  label ??= t('controls.nationalId');
  placeholder ??= t('controls.nationalIdExample');

  return (
    <DigitField
      label={label}
      placeholder={placeholder}
      transform={(r) => r.replace(/[\s-]/g, '')}
      {...props}
    />
  );
}
