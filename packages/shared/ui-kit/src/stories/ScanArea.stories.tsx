import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarcodeField } from '../fields/BarcodeField';
import { ScanArea } from '../scanning/ScanArea';
import type { ScanAreaProps } from '../scanning/ScanArea.types';

/**
 * PAT-SCAN-01: one scan area for sale, purchase and product entry (Figma 1196:935, 312:8988, 312:571). Desktop
 * relies on the hardware scanner (no button); mobile has the standard camera frame. Pair with `useScanIntake`.
 */
const meta: Meta<typeof ScanArea> = { title: 'Patterns/ScanArea', component: ScanArea };
export default meta;

const camera = (state: string): ScanAreaProps['camera'] => ({
  videoRef: () => undefined,
  state,
  start: () => undefined,
  stop: () => undefined,
});
const manual = <BarcodeField label="بارکد دستی" />;

export const Mobile: StoryObj<typeof ScanArea> = { args: { status: 'idle', manual, camera: camera('idle') } };
export const MobileCompactResolving: StoryObj<typeof ScanArea> = {
  args: { status: 'resolving', manual, camera: camera('scanning'), size: 'compact' },
};
export const MobileCameraDenied: StoryObj<typeof ScanArea> = {
  args: { status: 'idle', manual, camera: camera('denied') },
};
export const Desktop: StoryObj<typeof ScanArea> = {
  args: { status: 'idle', manual, camera: camera('idle') },
  globals: { device: 'desktop' },
};
export const DesktopNotFound: StoryObj<typeof ScanArea> = {
  args: { status: 'not-found', manual },
  globals: { device: 'desktop' },
};
export const DesktopFound: StoryObj<typeof ScanArea> = {
  args: { status: 'found', message: 'خودکار آبی به سبد اضافه شد · تعداد ۳', manual },
  globals: { device: 'desktop' },
};
