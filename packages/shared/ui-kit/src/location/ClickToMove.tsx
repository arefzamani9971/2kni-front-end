import { useMapEvents } from 'react-leaflet';
import type { GeoPoint } from './types';

export function ClickToMove({ onPick }: { onPick: (p: GeoPoint) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}
