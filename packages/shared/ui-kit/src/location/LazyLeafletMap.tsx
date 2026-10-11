'use client';
import { lazy } from 'react';

/** The Leaflet map loaded on demand, so the map library stays out of the form's bundle. */
export const LazyLeafletMap = lazy(() => import('./LeafletMap'));
