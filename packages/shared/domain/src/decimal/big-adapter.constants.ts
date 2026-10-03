import Big from 'big.js';
import type { RoundingMode } from './big-adapter.types';

export const RM: Record<RoundingMode, Big.RoundingMode> = {
  'half-up': Big.roundHalfUp,
  up: Big.roundUp,
  down: Big.roundDown,
};
