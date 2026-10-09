'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { IconButton } from '../primitives/IconButton';
import { TextField } from './TextField';
import type { BarcodeFieldProps } from './BarcodeField.types';

/** Barcode (Figma Field/Barcode): digits or GS1/internal codes, leading zeros kept, LTR, optional scan button. */
export function BarcodeField({ label, placeholder, onScan, suffix, ...props }: BarcodeFieldProps) {
  const t = useUiTranslations();
  label ??= t('controls.barcode');
  placeholder ??= t('controls.barcodePlaceholder');

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      dir="ltr"
      asciiDigits
      filter={{ pattern: /^[A-Za-z0-9\-_.]*$/, message: t('controls.barcodeInvalid') }}
      transform={(r) => r.trim()}
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
