import type { Ref } from 'react';
import type { ScanSize } from './ScanFrame.types';

export type ScanCameraProps = {
  readonly videoRef?: Ref<HTMLVideoElement>;
  readonly active: boolean;
  /** Aim instruction; also the video's accessible name. */
  readonly hint: string;
  /** Live status line (announced). */
  readonly status: string;
  readonly size: ScanSize;
};
