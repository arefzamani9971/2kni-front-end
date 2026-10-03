'use client';
import { DecimalField } from './DecimalField';
import type { DecimalInputProps } from './DecimalField.types';

export function PercentField({ maxDecimals = 2, ...props }: DecimalInputProps) {
  return <DecimalField maxDecimals={maxDecimals} unit="٪" {...props} />;
}
