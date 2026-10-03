import type { TextFieldProps } from './TextField.types';

export type BarcodeFieldProps = Omit<TextFieldProps, 'filter' | 'dir' | 'asciiDigits'> & {
  /** Opens the scanner; the field stays usable without a camera (B02). */
  onScan?: () => void;
};
