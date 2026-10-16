import type { Tone } from '../lib/types';
import type { ScanAreaStatus } from './ScanArea.types';

/** Status token per scan state; never a hand-picked green per screen. */
export const SCAN_STATUS_TONE: Readonly<Record<ScanAreaStatus, Tone>> = {
  idle: 'success',
  resolving: 'info',
  found: 'success',
  'not-found': 'warning',
  invalid: 'warning',
  error: 'danger',
};

/** Camera states that keep the video live. */
export const CAMERA_ON = new Set(['requesting', 'scanning']);
/** Camera states that need a manual-entry message instead of the camera. */
export const CAMERA_FAILED = new Set(['denied', 'unsupported', 'unavailable', 'insecure']);
