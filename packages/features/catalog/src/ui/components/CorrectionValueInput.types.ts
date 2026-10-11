import type { ReactNode } from 'react';
import type { CorrectionField } from '../../domain/correction.types';

export type CorrectionValueInputProps = {
  field: CorrectionField;
  /** The proposed value in the capability's text form; '' clears a clearable field. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label: ReactNode;
  message?: string;
};
