'use client';
import { useUnits } from './use-units';

import { CONTENT_DIMENSIONS } from '../constants/use-content-units.constants';

/** Units a net content can be expressed in (mass, volume, length); never count. */
export function useContentUnits() {
  const units = useUnits();
  return { units: (units.data ?? []).filter((u) => CONTENT_DIMENSIONS.has(u.dimension)), error: units.error };
}
