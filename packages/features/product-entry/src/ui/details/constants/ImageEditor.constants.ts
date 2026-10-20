import type { CropRect } from '@dukani/platform';

export const IMAGE_CROP_FIELDS = [
  'left',
  'top',
  'width',
  'height',
] as const satisfies readonly (keyof CropRect)[];

export const INITIAL_CROP_RECT: CropRect = { left: 0, top: 0, width: 100, height: 100 };
