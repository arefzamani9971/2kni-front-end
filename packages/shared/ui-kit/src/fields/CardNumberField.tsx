'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { GroupedDigitsField } from './GroupedDigitsField';
import type { GroupedProps } from './GroupedDigitsField.types';

/** شماره کارت — 16 digits shown as 4-4-4-4; value is the raw digits (Luhn checked by `rules.cardNumber()`). */
export function CardNumberField({ label, placeholder, ...props }: GroupedProps) {
  const t = useUiTranslations();
  label ??= t('controls.cardNumber');
  placeholder ??= t('controls.cardExample');

  return (
    <GroupedDigitsField
      label={label}
      placeholder={placeholder}
      maxDigits={16}
      groupSize={4}
      autoComplete="cc-number"
      {...props}
    />
  );
}
