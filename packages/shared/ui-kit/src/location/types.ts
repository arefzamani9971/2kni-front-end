export type GeoPoint = { readonly lat: number; readonly lng: number };

/** Default center: Tehran. */
export const DEFAULT_CENTER: GeoPoint = { lat: 35.6997, lng: 51.338 };

export const DEFAULT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const DEFAULT_ATTRIBUTION = '&copy; OpenStreetMap';
