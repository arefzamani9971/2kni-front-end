'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { toPersianDigits } from '@dukani/domain';
import { lazy, Suspense, useId, useState } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

import { BottomSheet } from '../overlays/BottomSheet';
import { Button } from '../primitives/Button';
import { Skeleton } from '../primitives/Skeleton';
import { FieldShell } from '../fields/FieldShell';
import { Alert } from '../feedback/Alert';
import { DEFAULT_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_TILE_URL } from './constants';
import type { GeoPoint } from './types';
import type { LocationFieldProps } from './LocationField.types';

const LeafletMap = lazy(() => import('./LeafletMap'));

const formatPoint = (p: GeoPoint) =>
  `${toPersianDigits(p.lat.toFixed(5))}، ${toPersianDigits(p.lng.toFixed(5))}`;

/**
 * Store/customer location. Optional by design: manual address entry is always possible and a
 * refused location permission never blocks the form (F03, BIZ-ORD-04).
 */
export function LocationField({
  label,
  value,
  onChange,
  tileUrl = DEFAULT_TILE_URL,
  attribution = DEFAULT_ATTRIBUTION,
  placeholder,
  className,
  ...props
}: LocationFieldProps) {
  const t = useUiTranslations();
  label ??= t('controls.location');
  placeholder ??= t('controls.chooseOnMap');

  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<GeoPoint | null>(value);
  const [center, setCenter] = useState<GeoPoint>(value ?? DEFAULT_CENTER);
  const [geoError, setGeoError] = useState<'geolocationUnsupported' | 'geolocationDenied' | null>(null);
  const [locating, setLocating] = useState(false);

  const locate = () => {
    if (!('geolocation' in navigator)) return setGeoError('geolocationUnsupported');
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
        setGeoError('geolocationDenied');
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
          className={cn(
            'tabular text-body-m h-full flex-1 text-start',
            value ? 'text-fg-primary' : 'text-fg-secondary',
          )}
        >
          {value ? formatPoint(value) : placeholder}
        </button>
      </FieldShell>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        full
        footer={
          <>
            <Button
              block
              disabled={!draft}
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              {t('controls.confirmLocation')}
            </Button>
            {value ? (
              <Button
                block
                variant="text"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                {t('controls.removeLocation')}
              </Button>
            ) : null}
          </>
        }
      >
        <div className="flex h-full flex-col gap-3">
          <Button variant="secondary" iconStart="locate" loading={locating} onClick={locate}>
            {t('controls.currentLocation')}
          </Button>
          {geoError ? <Alert tone="warning" title={t(`controls.${geoError}`)} /> : null}
          <div className="border-line relative min-h-72 flex-1 overflow-hidden rounded-md border">
            <Suspense fallback={<Skeleton className="absolute inset-0 rounded-none" />}>
              <LeafletMap
                value={draft}
                center={center}
                onChange={setDraft}
                tileUrl={tileUrl}
                attribution={attribution}
              />
            </Suspense>
          </div>
          <p className="text-body-s text-fg-secondary">{t('controls.mapHint')}</p>
        </div>
      </BottomSheet>
    </>
  );
}
