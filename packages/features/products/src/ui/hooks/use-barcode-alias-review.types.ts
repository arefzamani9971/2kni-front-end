import type { RefObject } from 'react';
import type { useBarcodeAlias } from './use-barcode-alias';

export type BarcodeAliasReviewOptions = {
  readonly flow: Pick<
    ReturnType<typeof useBarcodeAlias>,
    'busy' | 'unknown' | 'allowed' | 'preview' | 'reset'
  >;
  /** Current product version and selected sale unit; review waits until both are known. */
  readonly product: { readonly version: number } | undefined;
  readonly unit: { readonly id: string } | undefined;
  readonly barcode: string;
  /** The code field; it gets focus back when the code is rejected. */
  readonly input: RefObject<HTMLInputElement | null>;
};
