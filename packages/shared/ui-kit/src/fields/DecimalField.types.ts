import type { ReactNode, Ref } from 'react';
import type { Status } from '../lib/types';
import type { FieldClassNames, FieldStatusClassNames } from './FieldShell.types';

export type DecimalInputProps = {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  ref?: Ref<HTMLInputElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
  /** Maximum decimal digits; 0 means whole numbers, null means no input precision limit. */
  maxDecimals?: number | null;
  /** Group thousands with «٬» while typing. */
  grouping?: boolean;
  allowNegative?: boolean;
  /** Unit shown at the end of the field (e.g. «تومان», «کیلوگرم»). */
  unit?: ReactNode;
};
