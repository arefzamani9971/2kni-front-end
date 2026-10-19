'use client';
import { Alert } from '@dukani/ui-kit';
import type { StockUnitChoice } from '../../domain/stock-unit.types';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/**
 * Why the stock step starts without a unit (F12 §12, AC07): the draft's unit is no longer a purchase unit, or the
 * scanned barcode's unit cannot be bought. Shown until the seller chooses.
 */
export function StockUnitNotice({
  notice,
  scannedUnitName,
}: {
  notice: StockUnitChoice['notice'];
  scannedUnitName?: string;
}) {
  const t = useEntryTranslations();
  if (notice === 'stale')
    return <Alert tone="warning" title={t('unitStaleTitle')} description={t('unitStaleHint')} />;
  if (notice === 'scan')
    return (
      <Alert
        tone="warning"
        title={t('unitStaleTitle')}
        description={t('scannedUnitUnavailable', { unit: scannedUnitName ?? '' })}
      />
    );
  return null;
}
