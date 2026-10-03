import type { ReactNode } from 'react';
import type { Status } from '../lib/types';
import type { GeoPoint } from './types';

export type LocationFieldProps = {
  label?: ReactNode;
  value: GeoPoint | null;
  onChange: (value: GeoPoint | null) => void;
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  /** Tile server (OSM by default; Neshan/Map.ir tiles can be configured per environment). */
  tileUrl?: string;
  attribution?: string;
  className?: string;
};
