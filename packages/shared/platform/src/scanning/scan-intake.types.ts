import type { AppError } from '@dukani/domain';
import type { BarcodeCamera } from './barcode-camera.types';

export type ScanSource = 'hardware' | 'camera' | 'manual';

export type ScanIntakeStatus = 'idle' | 'resolving' | 'found' | 'not-found' | 'invalid' | 'error';

export type ScanIntakeOptions<R> = {
  /** Port call: the record behind a code, or `null` when nothing matches. Calls run one at a time, in scan order. */
  readonly resolve: (code: string, ctx: { readonly signal: AbortSignal; readonly source: ScanSource }) => Promise<R | null>;
  /** What this screen does with a match: the policy (sale +1, purchase «identify only») lives here, not in the UI. */
  readonly onResult: (result: R, code: string, source: ScanSource) => void;
  readonly onNotFound?: (code: string, source: ScanSource) => void;
  /** Listen to a keyboard-wedge scanner (default true; desktop sale and purchase). */
  readonly hardware?: boolean;
  readonly enabled?: boolean;
  /** Changing it (the active store) drops queued codes and stops the camera. */
  readonly resetKey?: string;
};

export type ScanIntake = {
  /** Manual entry submits here (Enter in the barcode field); false when the code is not a valid barcode. */
  readonly submit: (raw: string, source?: ScanSource) => boolean;
  readonly status: ScanIntakeStatus;
  readonly lastCode: string | null;
  readonly error: AppError | null;
  readonly camera: BarcodeCamera;
};
