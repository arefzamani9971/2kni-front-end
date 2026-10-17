'use client';
import { normalizeDigits } from '@dukani/domain';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { IconButton } from '../primitives/IconButton';
import { TextField } from './TextField';
import type { BarcodeFieldProps } from './BarcodeField.types';

/**
 * Barcode (Figma Field/Barcode 23:10): digits or GS1/internal codes, leading zeros kept, LTR, optional scan button.
 * Persian/Arabic digits are accepted and stored as ASCII; the code is also shown in Latin digits, as the design
 * shows every code (1255:55, 623:260) — unlike quantities and money, which are shown with Persian digits.
 */
export function BarcodeField({ label, placeholder, onScan, suffix, ...props }: BarcodeFieldProps) {
  const t = useUiTranslations();
  label ??= t('controls.barcode');
  placeholder ??= t('controls.barcodePlaceholder');

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      dir="ltr"
      filter={{ pattern: /^[A-Za-z0-9\-_.]*$/, message: t('controls.barcodeInvalid') }}
      transform={(r) => normalizeDigits(r).trim()}
      suffix={
        onScan ? (
          <IconButton
            icon="scan"
            label={t('controls.scanBarcode')}
            tone="brand"
            className="-me-3"
            onClick={onScan}
          />
        ) : (
          suffix
        )
      }
      {...props}
    />
  );
}
