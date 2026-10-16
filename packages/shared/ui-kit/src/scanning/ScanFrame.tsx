import { cn } from '../lib/cn';
import { SCAN_SIZE } from './ScanFrame.constants';
import type { ScanSize } from './ScanFrame.types';

/** The single scan viewfinder of the product: frame + idle barcode art, sized by `ScanSize`, never redrawn per screen. */
export function ScanFrame({ size, active }: { size: ScanSize; active: boolean }) {
  const { frame, art } = SCAN_SIZE[size];
  return (
    <div aria-hidden className={cn('border-surface relative flex items-center justify-center', frame)}>
      {!active ? <img alt="" src={art.src} width={art.width} height={art.height} /> : null}
    </div>
  );
}
