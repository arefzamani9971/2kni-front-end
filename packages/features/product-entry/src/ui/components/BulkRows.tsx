'use client';
import { decimal, money, parseDecimalInput } from '@dukani/domain';
import { Button, DecimalField, MoneyField, RecordList, Overlay, Icon, SelectField } from '@dukani/ui-kit';
import { useState } from 'react';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import type { BulkRow } from '../../domain/bulk-draft';
import { entryUnitsOf, titleOf } from '../../domain/entry-draft';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import type { BulkRowsProps } from './BulkRows.types';
export function BulkRows({ rows, disabled, onChange, onDelete }: BulkRowsProps) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const [editing, setEditing] = useState<string | null>(null);
  const fields = (row: BulkRow) => {
    const patch = (update: (row: BulkRow) => BulkRow) => onChange(row.clientRowId, update);
    const quantity = row.quantityInput ?? row.entry.stock?.quantity ?? '';
    const parsed = parseDecimalInput(quantity);
    const quantityField = (
      <DecimalField
        label={t('quantity')}
        value={quantity}
        maxDecimals={row.entry.catalog?.baseUnitMaxDecimals ?? 3}
        disabled={disabled}
        status={!parsed.ok || !decimal.isPositive(parsed.value) ? 'error' : 'default'}
        message={!parsed.ok || !decimal.isPositive(parsed.value) ? t('quantityRequired') : undefined}
        onChange={(raw) =>
          patch((r) => {
            const value = parseDecimalInput(raw);
            return {
              ...r,
              quantityInput: raw,
              entry: {
                ...r.entry,
                stock: r.entry.stock
                  ? { ...r.entry.stock, quantity: value.ok ? value.value : decimal.zero }
                  : null,
              },
            };
          })
        }
      />
    );
    const unitField = (
      <SelectField
        label={t('catalogUnit')}
        value={row.entry.stock?.unitKey ?? ''}
        disabled={disabled}
        options={entryUnitsOf(row.entry).map((u) => ({
          value: u.key,
          label: u.name,
          description: u.baseQty,
        }))}
        onChange={(unitKey) =>
          patch((r) => ({
            ...r,
            entry: { ...r.entry, stock: r.entry.stock ? { ...r.entry.stock, unitKey } : null },
          }))
        }
      />
    );
    const costField = (
      <MoneyField
        label={t('initialCost')}
        optional
        value={row.entry.stock?.unitCost?.amount ?? ''}
        disabled={disabled}
        onChange={(raw) =>
          patch((r) => {
            const value = parseDecimalInput(raw);
            return {
              ...r,
              entry: {
                ...r.entry,
                stock: r.entry.stock
                  ? {
                      ...r.entry.stock,
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
    const remove = (
      <Button variant="danger" disabled={disabled} onClick={() => onDelete(row.clientRowId)}>
        {t('bulk.delete')}
      </Button>
    );
    return {
      id: row.clientRowId,
      card: (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setEditing(row.clientRowId)}
          className="border-line bg-surface flex w-full items-center gap-3 rounded-lg border p-4 text-start"
        >
          <span className="bg-muted text-fg-primary flex size-12 shrink-0 items-center justify-center rounded-lg">
            {titleOf(row.entry).slice(0, 1)}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-body-m font-semibold">{titleOf(row.entry)}</span>
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
      ),
      cells: row.entry.stock
        ? [titleOf(row.entry), quantityField, unitField, costField, remove]
        : [titleOf(row.entry), t('noStockHint'), null, null, remove],
    };
  };
  return (
    <>
      <Overlay
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={
          rows.find((r) => r.clientRowId === editing)
            ? titleOf(rows.find((r) => r.clientRowId === editing)!.entry)
            : t('bulk.items')
        }
        actions={<Button onClick={() => setEditing(null)}>{t('back')}</Button>}
      >
        {rows.find((r) => r.clientRowId === editing)
          ? fields(rows.find((r) => r.clientRowId === editing)!)
              .cells.slice(1)
              .map((field, i) => <div key={i}>{field}</div>)
          : null}
      </Overlay>
      <RecordList
        label={t('bulk.items')}
        columns={[t('storeProduct'), t('quantity'), t('catalogUnit'), t('initialCost'), t('bulk.delete')]}
        rows={rows.map(fields)}
      />
    </>
  );
}
