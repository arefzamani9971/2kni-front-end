import type { InputFilter } from '@dukani/domain';
import type { FocusEventHandler, InputHTMLAttributes, ReactNode, Ref } from 'react';
import type { Status } from '../lib/types';
import type { FieldClassNames, FieldStatusClassNames } from './FieldShell.types';

export type TextFieldProps = {
  label?: ReactNode;
  hideLabel?: boolean;
  required?: boolean;
  optional?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  /**
   * Allowed characters: 'digits' (only numbers), 'letters', 'persian-letters' (only Persian letters),
   * 'persian' (Persian text), 'latin', 'alphanumeric', 'decimal', 'email' or `{ pattern, message }`.
   * A forbidden character is rejected (the previous value stays) and the filter message is shown.
   */
  filter?: InputFilter;
  /** Runs before the filter, e.g. to accept `+98` pastes. */
  transform?: (raw: string) => string;
  /** Emit ASCII digits (payload) while showing Persian digits in the field (ui-guidelines §14). */
  asciiDigits?: boolean;
  /** Called when an edit is rejected by the filter. */
  onReject?: (message: string) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  /** Numbers, codes and URLs are isolated LTR inside the RTL page. */
  dir?: 'rtl' | 'ltr' | 'auto';
  type?: 'text' | 'tel' | 'email' | 'search' | 'url' | 'password';
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  ref?: Ref<HTMLInputElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
  /** Escape hatch for attributes not covered above. */
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'>;
};
