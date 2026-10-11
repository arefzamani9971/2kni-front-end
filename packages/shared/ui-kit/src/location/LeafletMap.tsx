'use client';
// Adapter over Leaflet/react-leaflet — the only place that imports them. Loaded lazily (no SSR).
import 'leaflet/dist/leaflet.css';
import type L from 'leaflet';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import type { LeafletMapProps } from './LeafletMap.types';
import { ClickToMove } from './ClickToMove';
import { FollowCenter } from './FollowCenter';
import { pin } from './LeafletMap.constants';

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
