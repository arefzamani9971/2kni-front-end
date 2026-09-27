// Adapter over big.js. The rest of the codebase uses the `decimal` facade only, so the
// library can be replaced by changing this file.
import Big from 'big.js';

Big.DP = 20;
Big.RM = Big.roundHalfUp;

export type RoundingMode = 'half-up' | 'up' | 'down';

const RM: Record<RoundingMode, Big.RoundingMode> = {
  'half-up': Big.roundHalfUp,
  up: Big.roundUp,
  down: Big.roundDown,
};

export const bigAdapter = {
  canParse: (v: string): boolean => {
    try {
      new Big(v);
      return true;
    } catch {
      return false;
    }
  },
  normalize: (v: string | number): string => new Big(v).toString(),
  add: (a: string, b: string): string => new Big(a).plus(b).toString(),
  sub: (a: string, b: string): string => new Big(a).minus(b).toString(),
  mul: (a: string, b: string): string => new Big(a).times(b).toString(),
  div: (a: string, b: string, dp: number): string => new Big(a).div(b).round(dp, Big.roundHalfUp).toString(),
  cmp: (a: string, b: string): -1 | 0 | 1 => new Big(a).cmp(b) as -1 | 0 | 1,
  round: (v: string, dp: number, mode: RoundingMode): string => new Big(v).round(dp, RM[mode]).toString(),
  roundToStep: (v: string, step: string, mode: RoundingMode): string =>
    new Big(v).div(step).round(0, RM[mode]).times(step).toString(),
  toFixed: (v: string, dp: number): string => new Big(v).toFixed(dp),
};
