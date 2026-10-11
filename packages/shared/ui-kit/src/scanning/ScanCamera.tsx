'use client';
import { SCAN_ASSETS } from './ScanWorkspace.constants';
import type { ScanWorkspaceProps } from './ScanWorkspace.types';

/** The single camera surface of the scan workspace: video, frame and live status, sized per viewport. */
export function ScanCamera({
  videoRef,
  active,
  hint,
  status,
  desktop,
}: ScanWorkspaceProps & { desktop: boolean }) {
  return (
    <div
      className={`bg-brand-strong text-fg-inverse relative flex shrink-0 flex-col items-center justify-center gap-6 overflow-hidden rounded-lg ${desktop ? 'h-[552px] p-8' : 'h-[360px] p-4'}`}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        aria-label={hint}
        className={`absolute inset-0 h-full w-full object-cover ${active ? '' : 'invisible'}`}
      />
      {desktop ? <p className="text-heading-m relative">{hint}</p> : null}
      <div
        aria-hidden
        className={`border-surface relative flex items-center justify-center ${desktop ? 'h-[306px] w-[442px] max-w-full rounded-[27.2px] border-[3.4px]' : 'h-[180px] w-[260px] rounded-lg border-2'}`}
      >
        {!active ? (
          <img
            alt=""
            src={SCAN_ASSETS[desktop ? 'desktop' : 'mobile']}
            width={desktop ? 272 : 160}
            height={desktop ? 122.4 : 72}
          />
        ) : null}
      </div>
      <p role="status" className="text-body-m relative">
        {status}
      </p>
    </div>
  );
}
