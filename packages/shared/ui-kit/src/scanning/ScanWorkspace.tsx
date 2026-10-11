'use client';
import type { Ref, ReactNode } from 'react';
import { createAdaptive } from '../responsive/adaptive';
import { Button } from '../primitives/Button';

type Props = {
  videoRef?: Ref<HTMLVideoElement>;
  active: boolean;
  preview: boolean;
  hint: string;
  status: string;
  actions: readonly { kind: 'keyboard' | 'layers' | 'settings'; label: string; onClick: () => void }[];
  children?: ReactNode;
};
const assets = {
  keyboard: new URL('./assets/keyboard.svg', import.meta.url).href,
  layers: new URL('./assets/layers.svg', import.meta.url).href,
  settings: new URL('./assets/settings.svg', import.meta.url).href,
  mobile: new URL('./assets/barcode-mobile.svg', import.meta.url).href,
  desktop: new URL('./assets/barcode-desktop.svg', import.meta.url).href,
};
function Camera({ videoRef, active, hint, status, desktop }: Props & { desktop: boolean }) {
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
            src={assets[desktop ? 'desktop' : 'mobile']}
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
function Mobile(props: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className={props.preview ? 'contents' : 'hidden'}>
        <Camera {...props} desktop={false} />
        {props.actions.map((a) => (
          <Button key={a.kind} block variant="secondary" onClick={a.onClick}>
            {a.label}
          </Button>
        ))}
        <p className="text-body-m text-fg-secondary">{props.hint}</p>
      </div>
      {props.children}
    </div>
  );
}
function Desktop(props: Props) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <Camera {...props} desktop />
      </div>
      <div className="flex flex-col gap-6">
        {props.actions.map((a) => (
          <button
            key={a.kind}
            type="button"
            onClick={a.onClick}
            className="bg-surface border-line focus-visible:outline-focus flex h-[168px] flex-col items-start justify-between rounded-lg border p-4 text-start focus-visible:outline-2"
          >
            <span className="bg-brand-subtle flex size-10 items-center justify-center rounded-sm">
              <img src={assets[a.kind]} width={24} height={24} alt="" />
            </span>
            <span className="text-label-m">{a.label}</span>
          </button>
        ))}
      </div>
      {props.children}
    </div>
  );
}
/** Figma scan 312:8988 / 312:571. One camera element; feature owns lifecycle and commands. */
export const ScanWorkspace = createAdaptive<Props>('ScanWorkspace', { mobile: Mobile, desktop: Desktop });
