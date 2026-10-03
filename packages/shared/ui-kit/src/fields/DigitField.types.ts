import type { TextFieldProps } from './TextField.types';

export type DigitFieldProps = Omit<TextFieldProps, 'filter' | 'asciiDigits' | 'dir' | 'inputMode'>;
