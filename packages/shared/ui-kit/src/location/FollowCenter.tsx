import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { GeoPoint } from './types';

export function FollowCenter({ center }: { center: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], Math.max(map.getZoom(), 15), { animate: true });
  }, [center.lat, center.lng, map]);
  return null;
}
