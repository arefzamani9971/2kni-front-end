'use client';
import { memo } from 'react';
import { Icon } from '@dukani/ui-kit';
import { titleOf } from '../../../domain/entry-draft';
import { useEntryPresentation } from '../../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import type { BulkRowCardProps } from '../types/BulkRows.types';

export const BulkRowCard = memo(function BulkRowCard({ row, disabled, onEdit }: BulkRowCardProps) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const title = titleOf(row.entry);
  const quantity = row.quantityInput ?? row.entry.stock?.quantity ?? '';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onEdit(row.clientRowId)}
      className="border-line bg-surface flex w-full items-center gap-3 rounded-lg border p-4 text-start"
    >
      <span className="bg-muted text-fg-primary flex size-12 shrink-0 items-center justify-center rounded-lg">
        {title.slice(0, 1)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-body-m font-semibold">{title}</span>
        <span className="text-body-s">
          {row.entry.stock
            ? presentation.stockConversion(row.entry, quantity, row.entry.stock.unitKey)
            : t('noStockHint')}
        </span>
        <span className="text-body-s text-fg-secondary">
          {row.entry.stock?.unitCost
            ? presentation.money(row.entry.stock.unitCost)
            : t('lookup.unknownValue')}
        </span>
      </span>
      <Icon name="back" size={24} />
    </button>
  );
});
