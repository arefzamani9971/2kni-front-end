'use client';
import { useUnits } from './use-units';

const CONTENT_DIMENSIONS = new Set(['Mass', 'Volume', 'Length']);

/** Units a net content can be expressed in (mass, volume, length); never count. */
export function useContentUnits() {
  const units = useUnits();
  return { units: (units.data ?? []).filter((u) => CONTENT_DIMENSIONS.has(u.dimension)), error: units.error };
}
