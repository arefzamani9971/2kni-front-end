'use client';
import { useRef, useState } from 'react';
import { appError, isAppError, parseBarcode, type AppError } from '@dukani/domain';
import type { BarcodeAliasPreview } from '../../domain/barcode-alias.types';
import { useProductTranslations } from '../i18n/use-product-translations';
import type { BarcodeAliasReviewOptions } from './use-barcode-alias-review.types';

/**
 * Review step of the store barcode (US-F08-01): an invalid code is rejected before any request (F08 §7), one
 * preview runs at a time, and its result or failure stays until `reset` returns to editing.
 */
export function useBarcodeAliasReview({ flow, product, unit, barcode, input }: BarcodeAliasReviewOptions) {
  const t = useProductTranslations();
  const [preview, setPreview] = useState<BarcodeAliasPreview>();
  const [error, setError] = useState<AppError>();
  const [preparing, setPreparing] = useState(false);
  const lock = useRef(false);
  const review = async () => {
    if (!product || !unit || lock.current || flow.busy || preparing || flow.unknown || !flow.allowed) return;
    const code = parseBarcode(barcode);
    if (!code.ok) {
      setError(appError('Validation', 'BARCODE_INVALID', t('alias.invalid')));
      input.current?.focus();
      return;
    }
    lock.current = true;
    setPreparing(true);
    setError(undefined);
    try {
      setPreview(
        await flow.preview({
          storeProductUnitId: unit.id,
          barcode: code.value,
          expectedVersion: product.version,
        }),
      );
    } catch (e) {
      setError(isAppError(e) ? e : { kind: 'Bug', code: 'UNEXPECTED', message: '' });
      input.current?.focus();
    } finally {
      lock.current = false;
      setPreparing(false);
    }
  };
  const reset = () => {
    setPreview(undefined);
    setError(undefined);
    flow.reset();
  };
  return { preview, error, preparing, review, reset };
}
