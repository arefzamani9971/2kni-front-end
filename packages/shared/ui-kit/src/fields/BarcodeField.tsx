'use client';
import { IconButton } from '../primitives/IconButton';
import { TextField, type TextFieldProps } from './TextField';

export type BarcodeFieldProps = Omit<TextFieldProps, 'filter' | 'dir' | 'asciiDigits'> & {
  /** Opens the scanner; the field stays usable without a camera (B02). */
  onScan?: () => void;
};

/** Barcode (Figma Field/Barcode): digits or GS1/internal codes, leading zeros kept, LTR, optional scan button. */
export function BarcodeField({ label = 'بارکد', placeholder = 'بارکد را وارد یا اسکن کنید', onScan, suffix, ...props }: BarcodeFieldProps) {
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      dir="ltr"
      asciiDigits
      filter={{ pattern: /^[A-Za-z0-9\-_.]*$/, message: 'بارکد فقط رقم، حروف انگلیسی و - _ . دارد.' }}
      transform={(r) => r.trim()}
      suffix={onScan ? <IconButton icon="scan" label="اسکن بارکد" tone="brand" className="-me-3" onClick={onScan} /> : suffix}
      {...props}
    />
  );
}
