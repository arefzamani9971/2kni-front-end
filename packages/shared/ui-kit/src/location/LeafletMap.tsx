'use client';
// Adapter over Leaflet/react-leaflet — the only place that imports them. Loaded lazily (no SSR).
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import type { LeafletMapProps } from './LeafletMap.types';
import { ClickToMove } from './ClickToMove';
import { FollowCenter } from './FollowCenter';

const pin = L.divIcon({
  className: '',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 40 16 40s16-12.5 16-24.3C32 7 24.8 0 16 0z" fill="var(--dukani-color-bg-brand)"/><circle cx="16" cy="15.5" r="6" fill="#fff"/></svg>`,
});

export default function LeafletMap({
  value,
  center,
  onChange,
  tileUrl,
  attribution,
  readOnly,
  className,
}: LeafletMapProps) {
  const position = value ?? center;
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={value ? 16 : 12}
      scrollWheelZoom={!readOnly}
      dragging={!readOnly}
      className={className}
      style={{ height: '100%', width: '100%' }}
      attributionControl
    >
      <TileLayer url={tileUrl} attribution={attribution} />
      {value ? (
        <Marker
          position={[value.lat, value.lng]}
          icon={pin}
          draggable={!readOnly}
          eventHandlers={{
            dragend: (e) => {
              const ll = (e.target as L.Marker).getLatLng();
              onChange({ lat: ll.lat, lng: ll.lng });
            },
          }}
        />
      ) : null}
      {!readOnly ? <ClickToMove onPick={onChange} /> : null}
      {value ? <FollowCenter center={value} /> : null}
    </MapContainer>
  );
}
