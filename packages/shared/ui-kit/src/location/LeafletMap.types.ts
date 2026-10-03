import type { GeoPoint } from './types';

export type LeafletMapProps = {
  value: GeoPoint | null;
  center: GeoPoint;
  onChange: (p: GeoPoint) => void;
  tileUrl: string;
  attribution: string;
  readOnly?: boolean;
  className?: string;
};
