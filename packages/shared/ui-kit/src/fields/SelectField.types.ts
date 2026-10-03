import type { ReactNode, Ref } from 'react';
import type { Status } from '../lib/types';
import type { FieldClassNames, FieldStatusClassNames } from './FieldShell.types';

export type SelectOption<V extends string = string> = {
  value: V;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type SelectFieldProps<V extends string> = {
  label: ReactNode;
  value?: V | '';
  onChange?: (value: V) => void;
  onBlur?: () => void;
  options: readonly SelectOption<V>[];
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  /** Show a search box in the sheet (default when there are more than 8 options). */
  searchable?: boolean;
  /** Action at the end of the list, e.g. «ساخت نوع جدید». */
  createAction?: { label: string; onSelect: (query: string) => void };
  sheetTitle?: ReactNode;
  id?: string;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
};
