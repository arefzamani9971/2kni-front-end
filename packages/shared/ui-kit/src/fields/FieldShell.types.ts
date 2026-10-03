import type { ReactNode, Ref } from 'react';
import type { Status } from '../lib/types';

/** Class overrides per part of a field. */
export type FieldClassNames = Partial<
  Record<'root' | 'label' | 'box' | 'input' | 'prefix' | 'suffix' | 'message' | 'hint', string>
>;

/** Class overrides per status (e.g. a custom warning border): `{ warning: { box: '…', message: '…' } }`. */
export type FieldStatusClassNames = Partial<Record<Status, Partial<Record<'box' | 'message', string>>>>;

export type FieldShellProps = {
  id: string;
  label?: ReactNode;
  hideLabel?: boolean;
  required?: boolean;
  /** Shows «(اختیاری)» after the label. */
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
  /** The bordered box — anchor for popovers (Select, Autocomplete, Date) on desktop. */
  boxRef?: Ref<HTMLDivElement>;
  children: ReactNode;
};
