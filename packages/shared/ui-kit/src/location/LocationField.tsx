'use client';
import { toPersianDigits } from '@dukani/domain';
import { lazy, Suspense, useId, useState, type ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { BottomSheet } from '../overlays/BottomSheet';
import { Button } from '../primitives/Button';
import { Skeleton } from '../primitives/Skeleton';
import { FieldShell } from '../fields/FieldShell';
import { Alert } from '../feedback/Alert';
import { DEFAULT_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_TILE_URL, type GeoPoint } from './types';

const LeafletMap = lazy(() => import('./LeafletMap'));

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

const formatPoint = (p: GeoPoint) => `${toPersianDigits(p.lat.toFixed(5))}، ${toPersianDigits(p.lng.toFixed(5))}`;

/**
 * Store/customer location. Optional by design: manual address entry is always possible and a
 * refused location permission never blocks the form (F03, BIZ-ORD-04).
 */
export function LocationField({
  label = 'موقعیت روی نقشه',
  value,
  onChange,
  tileUrl = DEFAULT_TILE_URL,
  attribution = DEFAULT_ATTRIBUTION,
  className,
  ...props
}: LocationFieldProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<GeoPoint | null>(value);
  const [center, setCenter] = useState<GeoPoint>(value ?? DEFAULT_CENTER);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const locate = () => {
    if (!('geolocation' in navigator)) return setGeoError('مرورگر شما موقعیت‌یابی را پشتیبانی نمی‌کند؛ روی نقشه انتخاب کنید.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDraft(p);
        setCenter(p);
        setGeoError(null);
        setLocating(false);
      },
      () => {
        setGeoError('اجازه موقعیت داده نشد؛ می‌توانید روی نقشه انتخاب کنید یا نشانی را دستی بنویسید.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <>
      <FieldShell
        id={id}
        label={label}
        optional={props.optional}
        status={props.status}
        message={props.message}
        hint={props.hint}
        disabled={props.disabled}
        suffix={<Icon name="map-pin" size={20} className="text-icon" />}
        className={className}
        classNames={{ box: 'cursor-pointer' }}
      >
        <button
          id={id}
          type="button"
          disabled={props.disabled}
          onClick={() => {
            setDraft(value);
            setOpen(true);
          }}
          className={cn('tabular h-full flex-1 text-start text-body-m', value ? 'text-fg-primary' : 'text-fg-secondary')}
        >
          {value ? formatPoint(value) : 'انتخاب روی نقشه'}
        </button>
      </FieldShell>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        full
        footer={
          <>
            <Button block disabled={!draft} onClick={() => { onChange(draft); setOpen(false); }}>
              تأیید موقعیت
            </Button>
            {value ? (
              <Button block variant="text" onClick={() => { onChange(null); setOpen(false); }}>
                حذف موقعیت
              </Button>
            ) : null}
          </>
        }
      >
        <div className="flex h-full flex-col gap-3">
          <Button variant="secondary" iconStart="locate" loading={locating} onClick={locate}>
            موقعیت فعلی من
          </Button>
          {geoError ? <Alert tone="warning" title={geoError} /> : null}
          <div className="relative min-h-72 flex-1 overflow-hidden rounded-md border border-line">
            <Suspense fallback={<Skeleton className="absolute inset-0 rounded-none" />}>
              <LeafletMap value={draft} center={center} onChange={setDraft} tileUrl={tileUrl} attribution={attribution} />
            </Suspense>
          </div>
          <p className="text-body-s text-fg-secondary">روی نقشه بزنید یا نشانگر را جابه‌جا کنید.</p>
        </div>
      </BottomSheet>
    </>
  );
}
