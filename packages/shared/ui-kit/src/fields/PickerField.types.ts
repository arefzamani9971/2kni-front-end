import type { ReactNode, Ref } from 'react';
import type { Status } from '../lib/types';
import type { FieldClassNames, FieldStatusClassNames } from './FieldShell.types';

export type PickerFieldProps = {
  label: ReactNode;
  /** Text of the current choice; `placeholder` when empty. */
  display?: ReactNode;
  placeholder?: string;
  /** Opens the picker (a full screen step such as ST02, or a sheet owned by the caller). */
  onOpen: () => void;
  onBlur?: () => void;
  required?: boolean;
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  id?: string;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
};
