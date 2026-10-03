'use client';
// Numeric Field family (Figma 403:2: MobileIR | OTP | Integer) and other digit-only identity fields.
// All share the DigitInput contract: digits-only string, Persian/Arabic digits normalized, leading
// zeros kept, never converted to Number, LTR isolated value inside the RTL form (ui-guidelines 2.4.1).
import { TextField } from './TextField';
import type { DigitFieldProps } from './DigitField.types';

/** Base for digit-only inputs. */
export function DigitField(props: DigitFieldProps) {
  return <TextField dir="ltr" inputMode="numeric" filter="digits" asciiDigits {...props} />;
}
