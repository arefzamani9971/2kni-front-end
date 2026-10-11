'use client';
import { useState } from 'react';
import { parseDecimalInput } from '@dukani/domain';
import { Button, DecimalField, Overlay } from '@dukani/ui-kit';
import type { BulkRow } from '../../domain/bulk-draft';
import { titleOf } from '../../domain/entry-draft';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** «اسکن، سپس تعداد»: the scanned item waits here until a quantity is entered. */
export function BulkQuantityDialog({
  row,
  onCancel,
  onConfirm,
}: {
  row: BulkRow | null;
  onCancel: () => void;
  onConfirm: (quantity: string) => void;
}) {
  const t = useEntryTranslations();
  const [quantity, setQuantity] = useState('');
  return (
    <Overlay
      open={!!row}
      onOpenChange={(open) => {
        if (!open) {
          setQuantity('');
          onCancel();
        }
      }}
      title={row ? titleOf(row.entry) : t('quantity')}
      actions={
        <Button
          disabled={!quantity || !parseDecimalInput(quantity).ok}
          onClick={() => {
            onConfirm(quantity);
            setQuantity('');
          }}
        >
          {t('bulk.addRow')}
        </Button>
      }
    >
      <DecimalField
        label={t('quantity')}
        value={quantity}
        onChange={setQuantity}
        required
        maxDecimals={row?.entry.catalog?.baseUnitMaxDecimals ?? 3}
      />
    </Overlay>
  );
}
