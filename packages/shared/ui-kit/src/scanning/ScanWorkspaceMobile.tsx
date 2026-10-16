'use client';
import { Button } from '../primitives/Button';
import { ScanCamera } from './ScanCamera';
import type { ScanWorkspaceProps } from './ScanWorkspace.types';

/** Figma scan 312:8988: camera, stacked actions and hint on mobile. */
export function ScanWorkspaceMobile(props: ScanWorkspaceProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className={props.preview ? 'contents' : 'hidden'}>
        <ScanCamera videoRef={props.videoRef} active={props.active} hint={props.hint} status={props.status} size="regular" />
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
