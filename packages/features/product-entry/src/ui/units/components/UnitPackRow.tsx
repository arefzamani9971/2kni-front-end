'use client';
import { memo } from 'react';
import { BarcodeField, Checkbox, DecimalField, IconButton, Text, TextField } from '@dukani/ui-kit';
import { PACK_NAME_MAX } from '../../../domain/pack-rows';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import type { UnitPackRowProps } from '../types/UnitPackRow.types';

/** Unchanged package rows keep their input subtree while another row is edited. */
export const UnitPackRow = memo(function UnitPackRow({
  row,
  index,
  base,
  maxDecimals,
  onChange,
  onRemove,
}: UnitPackRowProps) {
  const t = useEntryTranslations();
  return (
    <div className="border-line flex flex-col gap-3 border-b pb-3 last:border-0">
      <div className="flex items-center gap-2">
        <p className="text-label-m text-fg-primary flex-1">{t('packOrdinal', { count: index + 1 })}</p>
        <IconButton icon="trash" label={t('removePack')} tone="danger" onClick={() => onRemove(index)} />
      </div>
      <TextField
        label={t('packName')}
        value={row.name}
        status={row.error === 'name' || row.error === 'duplicate' ? 'error' : undefined}
        message={
          row.error === 'name'
            ? t('packNameRequired')
            : row.error === 'duplicate'
              ? t('packNameDuplicate')
              : undefined
        }
        onChange={(name) => onChange(index, { name })}
        maxLength={PACK_NAME_MAX}
      />
      <DecimalField
        label={t('packQuantity')}
        unit={base}
        maxDecimals={maxDecimals}
        value={row.baseQty}
        status={row.error === 'quantity' ? 'error' : undefined}
        message={
          row.error === 'quantity'
            ? t(maxDecimals ? 'packQuantityError' : 'packQuantityWhole', { base })
            : undefined
        }
        onChange={(baseQty) => onChange(index, { baseQty })}
      />
      <BarcodeField
        label={t('manufacturerBarcode')}
        optional
        value={row.barcode ?? ''}
        status={row.error === 'barcode' ? 'error' : undefined}
        message={row.error === 'barcode' ? t('lookup.invalid') : undefined}
        onChange={(barcode) => onChange(index, { barcode })}
      />
      <Checkbox
        label={t('packSellable')}
        checked={row.isSellable ?? true}
        onChange={(isSellable) => onChange(index, { isSellable })}
      />
      <Checkbox
        label={t('packPurchasable')}
        checked={row.isPurchasable ?? true}
        onChange={(isPurchasable) => onChange(index, { isPurchasable })}
      />
      {row.error === 'uses' ? (
        <Text variant="body-s" tone="danger" role="alert">
          {t('packUsesRequired')}
        </Text>
      ) : null}
    </div>
  );
});
