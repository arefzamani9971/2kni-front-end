import L from 'leaflet';

/** Brand-coloured map pin (SVG divIcon, tip at the bottom centre). */
export const pin = L.divIcon({
  className: '',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 40 16 40s16-12.5 16-24.3C32 7 24.8 0 16 0z" fill="var(--dukani-color-bg-brand)"/><circle cx="16" cy="15.5" r="6" fill="#fff"/></svg>`,
});
