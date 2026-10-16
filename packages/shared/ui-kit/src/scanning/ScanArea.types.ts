import type { ReactNode } from 'react';
import type { ScanSize } from './ScanFrame.types';

/** Same values as `useScanIntake().status` (@dukani/platform). */
export type ScanAreaStatus = 'idle' | 'resolving' | 'found' | 'not-found' | 'invalid' | 'error';

/** Camera controls; `useScanIntake().camera` / `useBarcodeCamera()` fit as they are. */
export type ScanAreaCamera = {
  readonly videoRef: (node: HTMLVideoElement | null) => void;
  /** idle | requesting | scanning | paused | denied | unsupported | unavailable | insecure */
  readonly state: string;
  readonly start: () => unknown;
  readonly stop: () => void;
};

export type ScanAreaProps = {
  readonly status: ScanAreaStatus;
  /** Screen-specific result text («خودکار آبی به سبد اضافه شد»); default texts otherwise. */
  readonly message?: ReactNode;
  /** Manual entry (`BarcodeField` whose Enter calls `intake.submit`). */
  readonly manual: ReactNode;
  /** Omit when the screen has no camera option. */
  readonly camera?: ScanAreaCamera;
  /** Mobile camera height: `regular` 360 (scan-first screens), `compact` 220 (beside a cart or form). */
  readonly size?: Exclude<ScanSize, 'large'>;
};
