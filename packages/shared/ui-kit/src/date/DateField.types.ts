import type { DateOnly } from '@dukani/domain';
import type { ReactNode, Ref } from 'react';
import type { Status } from '../lib/types';
import type { FieldClassNames, FieldStatusClassNames } from '../fields/FieldShell.types';

export type DateFieldProps = {
  label: ReactNode;
  /** Gregorian DateOnly (`2026-09-27`); shown and picked as Jalali. */
  value?: DateOnly | '';
  onChange?: (value: DateOnly | '') => void;
  onBlur?: () => void;
  min?: DateOnly;
  max?: DateOnly;
  required?: boolean;
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
};
