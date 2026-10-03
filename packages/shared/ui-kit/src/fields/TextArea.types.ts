import type { InputFilter } from '@dukani/domain';
import type { FocusEventHandler, ReactNode, Ref } from 'react';
import type { Status } from '../lib/types';
import type { FieldClassNames, FieldStatusClassNames } from './FieldShell.types';

export type TextAreaProps = {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  filter?: InputFilter;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
  ref?: Ref<HTMLTextAreaElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
  /** Shows «۱۲/۲۰۰» under the field when maxLength is set. */
  showCount?: boolean;
};
