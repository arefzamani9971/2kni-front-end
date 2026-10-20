'use client';
import { useActiveStore, useScanIntake } from '@dukani/platform';
import type { BarcodeIdentification } from '../../domain/product-page.types';
import { usePurchasingModule } from '../../module';

/**
 * Barcode identification for a receipt (CPB-18): manual entry, a keyboard-wedge scanner and the camera go through
 * the one scan intake and only name a product and its unit — never a receipt, a quantity or a «+1». A repeated scan
 * is just the same identification again, not a retry of any command.
 */
export function useProductIdentification({
  onProduct,
  onMissing,
  onAmbiguous,
  enabled = true,
}: {
  readonly onProduct: (productId: string, unitId: string | null) => void;
  /** No active goods product of this store has the code: offer to register it. */
  readonly onMissing: (code: string) => void;
  readonly onAmbiguous: (code: string) => void;
  readonly enabled?: boolean;
}) {
  const { barcodes } = usePurchasingModule();
  const store = useActiveStore();
  return useScanIntake<Exclude<BarcodeIdentification, { kind: 'not-in-store' }>>({
    resolve: async (code, { signal }) => {
      const found = await barcodes.identify(store.id, code, signal);
      return found.kind === 'not-in-store' ? null : found;
    },
    onResult: (found, code) =>
      found.kind === 'product' ? onProduct(found.productId, found.unitId) : onAmbiguous(code),
    onNotFound: (code) => onMissing(code),
    enabled,
    resetKey: store.id,
  });
}
