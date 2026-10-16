'use client';
import { cn } from '../lib/cn';
import type { ScanCameraProps } from './ScanCamera.types';
import { SCAN_SIZE } from './ScanFrame.constants';
import { ScanFrame } from './ScanFrame';

/** The single camera surface of the product: video, the shared `ScanFrame` and a live status, in a standard size. */
export function ScanCamera({ videoRef, active, hint, status, size }: ScanCameraProps) {
  return (
    <div
      className={cn(
        'bg-brand-strong text-fg-inverse relative flex shrink-0 flex-col items-center justify-center gap-6 overflow-hidden rounded-lg',
        SCAN_SIZE[size].box,
      )}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        aria-label={hint}
        className={cn('absolute inset-0 h-full w-full object-cover', !active && 'invisible')}
      />
      {size === 'large' ? <p className="text-heading-m relative">{hint}</p> : null}
      <ScanFrame size={size} active={active} />
      <p role="status" className="text-body-m relative">
        {status}
      </p>
    </div>
  );
}
