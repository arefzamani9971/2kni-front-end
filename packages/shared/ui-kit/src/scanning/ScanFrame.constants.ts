import type { ScanSize } from './ScanFrame.types';
import { SCAN_ASSETS } from './ScanWorkspace.constants';

/**
 * The three standard camera sizes (PAT-SCAN-01): `large` = desktop scan page (Figma scan 312:571), `regular` =
 * mobile scan area 360 (sale 1196:935, scan 312:8988), `compact` = beside a form or cart. Every screen uses one of
 * these; no screen draws its own frame.
 */
export const SCAN_SIZE: Readonly<
  Record<ScanSize, { box: string; frame: string; art: { src: string; width: number; height: number } }>
> = {
  large: {
    box: 'h-[552px] p-8',
    frame: 'h-[306px] w-[442px] max-w-full rounded-[27.2px] border-[3.4px]',
    art: { src: SCAN_ASSETS.desktop, width: 272, height: 122.4 },
  },
  regular: {
    box: 'h-[360px] p-4',
    frame: 'h-[180px] w-[260px] max-w-full rounded-lg border-2',
    art: { src: SCAN_ASSETS.mobile, width: 160, height: 72 },
  },
  compact: {
    box: 'h-[220px] p-3',
    frame: 'h-[120px] w-[200px] max-w-full rounded-lg border-2',
    art: { src: SCAN_ASSETS.mobile, width: 120, height: 54 },
  },
};
