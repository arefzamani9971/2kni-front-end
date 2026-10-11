'use client';
import { ScanCamera } from './ScanCamera';
import { SCAN_ASSETS } from './ScanWorkspace.constants';
import type { ScanWorkspaceProps } from './ScanWorkspace.types';

/** Figma scan 312:571: camera beside the action cards on desktop. */
export function ScanWorkspaceDesktop(props: ScanWorkspaceProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <ScanCamera {...props} desktop />
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
              <img src={SCAN_ASSETS[a.kind]} width={24} height={24} alt="" />
            </span>
            <span className="text-label-m">{a.label}</span>
          </button>
        ))}
      </div>
      {props.children}
    </div>
  );
}
