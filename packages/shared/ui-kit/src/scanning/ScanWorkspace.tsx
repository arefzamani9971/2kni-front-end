'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { ScanWorkspaceProps } from './ScanWorkspace.types';
import { ScanWorkspaceDesktop } from './ScanWorkspaceDesktop';
import { ScanWorkspaceMobile } from './ScanWorkspaceMobile';

/** Figma scan 312:8988 / 312:571. One camera element; feature owns lifecycle and commands. */
export const ScanWorkspace = createAdaptive<ScanWorkspaceProps>('ScanWorkspace', {
  mobile: ScanWorkspaceMobile,
  desktop: ScanWorkspaceDesktop,
});
