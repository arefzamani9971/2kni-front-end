'use client';
import { DecimalField, type DecimalInputProps } from './DecimalField';

export function PercentField({ maxDecimals = 2, ...props }: DecimalInputProps) {
  return <DecimalField maxDecimals={maxDecimals} unit="٪" {...props} />;
}
