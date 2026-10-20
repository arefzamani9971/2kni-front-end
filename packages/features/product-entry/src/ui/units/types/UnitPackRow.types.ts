import type { PackRow } from '../../../domain/pack-rows.types';
import type { Row } from './UnitsForm.types';

export type UnitPackRowProps = {
  readonly row: Row;
  readonly index: number;
  readonly base: string;
  readonly maxDecimals: number;
  readonly onChange: (index: number, change: Partial<PackRow>) => void;
  readonly onRemove: (index: number) => void;
};
