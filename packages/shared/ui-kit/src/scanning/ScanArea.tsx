'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { ScanAreaProps } from './ScanArea.types';
import { ScanAreaDesktop } from './ScanAreaDesktop';
import { ScanAreaMobile } from './ScanAreaMobile';

/**
 * The one scan area of the product (PAT-SCAN-01) for sale, purchase, product entry and amendments: same frame,
 * colors and states everywhere. What a scan *does* (sale +1, purchase «identify only») is the screen's policy in
 * `useScanIntake({ onResult })`, never a different component.
 */
export const ScanArea = createAdaptive<ScanAreaProps>('ScanArea', {
  mobile: ScanAreaMobile,
  desktop: ScanAreaDesktop,
});
