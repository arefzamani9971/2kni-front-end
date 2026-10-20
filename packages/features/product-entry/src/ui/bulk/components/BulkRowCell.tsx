'use client';
import { memo } from 'react';
import { decimal, money, parseDecimalInput } from '@dukani/domain';
import { Button, DecimalField, MoneyField, SelectField } from '@dukani/ui-kit';
import type { BulkRow } from '../../../domain/bulk-draft';
import { entryUnitsOf, titleOf } from '../../../domain/entry-draft';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import type { BulkRowCellProps } from '../types/BulkRows.types';

export const BulkRowCell = memo(function BulkRowCell({
  row,
  column,
  disabled,
  onChange,
  onDelete,
}: BulkRowCellProps) {
  const t = useEntryTranslations();
  const patch = (update: (current: BulkRow) => BulkRow) => onChange(row.clientRowId, update);
  if (column === 'title') return titleOf(row.entry);
  if (column === 'delete')
    return (
      <Button variant="danger" disabled={disabled} onClick={() => onDelete(row.clientRowId)}>
        {t('bulk.delete')}
      </Button>
    );
  if (!row.entry.stock) return column === 'quantity' ? t('noStockHint') : null;

  switch (column) {
    case 'quantity': {
      const quantity = row.quantityInput ?? row.entry.stock.quantity;
      const parsed = parseDecimalInput(quantity);
      const invalid = !parsed.ok || !decimal.isPositive(parsed.value);
      return (
        <DecimalField
          label={t('quantity')}
          value={quantity}
          maxDecimals={row.entry.catalog?.baseUnitMaxDecimals ?? 3}
          disabled={disabled}
          status={invalid ? 'error' : 'default'}
          message={invalid ? t('quantityRequired') : undefined}
          onChange={(raw) =>
            patch((current) => {
              const value = parseDecimalInput(raw);
              return {
                ...current,
                quantityInput: raw,
                entry: {
                  ...current.entry,
                  stock: current.entry.stock
                    ? { ...current.entry.stock, quantity: value.ok ? value.value : decimal.zero }
                    : null,
                },
              };
            })
          }
        />
      );
    }
    case 'unit':
      return (
        <SelectField
          label={t('catalogUnit')}
          value={row.entry.stock.unitKey}
          disabled={disabled}
          options={entryUnitsOf(row.entry).map((unit) => ({
            value: unit.key,
            label: unit.name,
            description: unit.baseQty,
          }))}
          onChange={(unitKey) =>
            patch((current) => ({
              ...current,
              entry: {
                ...current.entry,
                stock: current.entry.stock ? { ...current.entry.stock, unitKey } : null,
              },
            }))
          }
        />
      );
    case 'cost':
      return (
        <MoneyField
          label={t('initialCost')}
          optional
          value={row.entry.stock.unitCost?.amount ?? ''}
          disabled={disabled}
          onChange={(raw) =>
            patch((current) => {
              const value = parseDecimalInput(raw);
              return {
                ...current,
                entry: {
                  ...current.entry,
                  stock: current.entry.stock
                    ? {
                        ...current.entry.stock,
                        unitCost: value.ok ? money(value.value) : null,
                        costStatus: value.ok ? 'Known' : 'Unknown',
                      }
                    : null,
                },
              };
            })
          }
        />
      );
  }
});
